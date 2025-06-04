// supabase/functions/payment-callback/index.ts
import { serve } from 'https://deno.land/std@0.147.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseUrl = 'https://zzrnqnqhkalsiwxqeifw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cm5xbnFoa2Fsc2l3eHFlaWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU5ODkxMSwiZXhwIjoyMDY0MTc0OTExfQ.ZpZ80JWUHvEiybH6loP1GobSBSw8l2R210NvNMdHCt4';
const webhookToken = 'PDtA0Ivv0iX3RBYOR62t1YFHQVeghhvMXa94Ov5diT1PSWAb';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function verifyWebhookSignature(body, signature) {
  try {
    const hmac = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(webhookToken));
    const computedSignature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    return hmac === computedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
async function updateStatus(paymentId, status) {
  console.log(`Updating participant status for payment_id: ${paymentId}`);
  const { data: participant, error: participantError } = await supabase.from('participants').select('*').eq('payment_id', paymentId).single();
  if (participantError) {
    console.error(`Error getting participant:`, participantError);
    return participantError;
  }
  if (!participant) {
    console.error('Participant not found for payment_id:', paymentId);
    return new Error('Participant not found');
  }
  // Update status
  const { error: statusError } = await supabase.from('participants').update({
    payment_status: status,
    updated_at: new Date().toISOString()
  }).eq('payment_id', paymentId);
  if (statusError) {
    console.error(`Error updating participant status:`, statusError);
    return statusError;
  }
  // Generate receipt if status is PAID
  if (status === 'PAID') {
    try {
      // Generate receipt URL
      const receiptUrl = `https://example.com/receipts/${participant.id}.html`;
      const barcodeUrl = `https://example.com/barcodes/${participant.id}.png`;
      // Update receipt and barcode URLs
      const { error: receiptError } = await supabase.from('participants').update({
        receipt_url: receiptUrl,
        barcode_url: barcodeUrl,
        updated_at: new Date().toISOString()
      }).eq('payment_id', paymentId);
      if (receiptError) {
        console.error(`Error updating receipt_url:`, receiptError);
        return receiptError;
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      return error;
    }
  }
  return null;
}
serve(async (req)=>{
  try {
    console.log('Received webhook request');
    console.log('Request headers:', req.headers);
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response('Method not allowed', {
        status: 405
      });
    }
    const signature = req.headers.get('x-xendit-signature');
    if (!signature) {
      console.error('Missing Xendit signature');
      return new Response('Unauthorized', {
        status: 401
      });
    }
    console.log('Received signature:', signature);
    const body = await req.text();
    console.log('Received webhook body:', body);
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', {
        status: 401
      });
    }
    const jsonBody = JSON.parse(body);
    const { payment_id, status } = jsonBody;
    console.log('Parsed webhook data:', {
      payment_id,
      status
    });
    const participantError = await updateStatus(payment_id, status);
    if (participantError) {
      console.error('Error updating participant status:', participantError);
      return new Response('Error updating participant status', {
        status: 500
      });
    }
    const { error: historyError } = await supabase.from('payment_history').insert({
      payment_id,
      status,
      notes: `Payment status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
    if (historyError) {
      console.error('Error logging payment history:', historyError);
    }
    return new Response(JSON.stringify({
      success: true,
      status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in payment callback handler:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
console.log('Payment callback server running on port 3000');
