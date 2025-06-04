import { serve } from 'https://deno.land/std@0.147.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get Supabase and Xendit credentials from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY'); // Or SUPABASE_SERVICE_ROLE_KEY if admin actions are needed
const xenditWebhookToken = Deno.env.get('XENDIT_WEBHOOK_TOKEN'); // Store your Xendit callback verification token here

if (!supabaseUrl || !supabaseAnonKey || !xenditWebhookToken) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, XENDIT_WEBHOOK_TOKEN');
  // Deno.exit(1); // Optional: exit if critical env vars are missing, though serve() might handle this gracefully
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!); 

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Function to verify Xendit webhook signature
async function verifyXenditSignature(body: string, signatureFromHeader: string, callbackToken: string): Promise<boolean> {
  try {
    if (!signatureFromHeader) {
      console.error('Signature from header is missing for verification.');
      return false;
    }
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(callbackToken),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureArrayBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(body)
    );
    const computedSignatureHex = bufferToHex(signatureArrayBuffer);
    return computedSignatureHex.toLowerCase() === signatureFromHeader.toLowerCase();
  } catch (error) {
    console.error('Error verifying Xendit webhook signature:', error);
    return false;
  }
}

// Function to update participant status and potentially generate receipt
async function updateParticipantPaymentStatus(paymentId: string, newStatus: string) {
  console.log(`Updating participant status for payment_id: ${paymentId} to ${newStatus}`);
  
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('id, payment_status') // Only select what's needed
    .eq('payment_id', paymentId)
    .single();

  if (participantError) {
    console.error(`Error fetching participant with payment_id ${paymentId}:`, participantError);
    throw new Error(`Participant lookup failed: ${participantError.message}`);
  }

  if (!participant) {
    console.warn('Participant not found for payment_id:', paymentId);
    throw new Error('Participant not found');
  }

  // Avoid redundant updates if status is already the same
  if (participant.payment_status === newStatus) {
    console.log(`Participant ${participant.id} status already ${newStatus}. No update needed.`);
    return; // Or handle as success
  }

  const updates: { payment_status: string; updated_at: string; receipt_url?: string; barcode_url?: string } = {
    payment_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === 'PAID') {
    // Generate receipt and barcode URLs (example implementation)
    updates.receipt_url = `https://example.com/receipts/${participant.id}.html`; // Replace with actual generation logic
    updates.barcode_url = `https://example.com/barcodes/${participant.id}.png`; // Replace with actual generation logic
    console.log(`Generated receipt_url: ${updates.receipt_url} and barcode_url: ${updates.barcode_url} for participant ${participant.id}`);
  }

  const { error: updateError } = await supabase
    .from('participants')
    .update(updates)
    .eq('payment_id', paymentId);

  if (updateError) {
    console.error(`Error updating participant status for payment_id ${paymentId}:`, updateError);
    throw new Error(`Participant status update failed: ${updateError.message}`);
  }
  console.log(`Successfully updated participant status for payment_id ${paymentId} to ${newStatus}`);
}

// Main request handler
serve(async (req: Request) => {
  console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${req.url}`);
  // Log all headers for debugging
  console.log('--- Incoming Headers ---');
  req.headers.forEach((value, key) => {
    console.log(`Header: ${key}: ${value}`);
  });
  console.log('--- End of Headers ---');

  if (req.method !== 'POST') {
    console.warn('Invalid method:', req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }

  const xenditSignature = req.headers.get('x-xendit-signature'); // Or 'x-callback-token' depending on Xendit's config for this webhook
  if (!xenditSignature) {
    console.warn('CRITICAL: Missing Xendit signature header. Expected x-xendit-signature (or x-callback-token if configured differently). Please check Xendit webhook configuration and actual headers received (logged above).');
    return new Response('Unauthorized: Missing or incorrect signature header from Xendit.', { status: 401 });
  }
  // console.log('Received Xendit signature:', xenditSignature);

  let requestBodyText;
  try {
    requestBodyText = await req.text();
    // console.log('Received webhook body:', requestBodyText);
  } catch (err) {
    console.error('Error reading request body:', err);
    return new Response('Error reading request body', { status: 400 });
  }

  if (!xenditWebhookToken) {
    console.error('XENDIT_WEBHOOK_TOKEN is not configured in environment variables.');
    return new Response('Internal Server Error: Webhook token not configured', { status: 500 });
  }

  const isValidSignature = await verifyXenditSignature(requestBodyText, xenditSignature, xenditWebhookToken);
  if (!isValidSignature) {
    console.warn('Invalid Xendit signature.');
    return new Response('Unauthorized: Invalid signature', { status: 401 });
  }
  console.log('Xendit signature verified successfully.');

  try {
    const payload = JSON.parse(requestBodyText);
    console.log('Parsed webhook payload:', payload);

    const { payment_id, status, external_id, amount } = payload; // Adjust based on actual Xendit payload structure

    if (!payment_id || !status) {
      console.warn('Missing payment_id or status in webhook payload.');
      return new Response('Bad Request: Missing payment_id or status', { status: 400 });
    }

    // Update participant status
    await updateParticipantPaymentStatus(payment_id, status);

    // Log to payment_history
    const { error: historyError } = await supabase.from('payment_history').insert({
      payment_id,
      status,
      notes: `Webhook: Payment status updated to ${status}. Amount: ${amount || 'N/A'}. External ID: ${external_id || 'N/A'}`,
      raw_payload: payload, // Storing the raw payload can be useful for debugging
      timestamp: new Date().toISOString(),
    });

    if (historyError) {
      console.error('Error logging to payment_history:', historyError);
      // Non-critical, so don't fail the whole request, but log it
    }

    console.log(`Successfully processed webhook for payment_id: ${payment_id}`);
    return new Response(JSON.stringify({ success: true, message: 'Webhook processed successfully', status_updated_to: status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook payload or updating database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: 'Failed to process webhook', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

console.log('Payment callback Edge Function initialized. Waiting for requests...');
