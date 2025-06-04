import axios from 'axios';
import { supabase } from './supabase';

interface CreatePaymentArgs {
  amount: number;
  externalId: string;
  description: string;
  customerDetails: {
    name: string;
    email: string;
    whatsapp: string;
  };
  successRedirectUrl: string;
  failureRedirectUrl: string;
}



async function logPaymentHistory(paymentId: string, status: string, notes: string) {
  const { error } = await supabase
    .from('payment_history')
    .insert({
      payment_id: paymentId,
      status,
      timestamp: new Date().toISOString(),
      notes
    });

  if (error) {
    console.error('Error logging payment history:', error);
  }
}

async function updatePaymentQueue(paymentId: string, status: string) {
  const { error } = await supabase
    .from('payment_queue')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', paymentId);

  if (error) {
    console.error('Error updating payment queue:', error);
  }
}

async function sendAdminNotification(type: string, data: any) {
  // Implementasi notifikasi admin
  console.log('Sending admin notification:', { type, data });
}

export async function createPayment({
  amount,
  externalId,
  description,
  customerDetails,
  successRedirectUrl,
  failureRedirectUrl
}: CreatePaymentArgs) {
  try {
    // Get Xendit API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('xendit_api_key')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.xendit_api_key) {
      throw new Error('Failed to retrieve Xendit API key from settings');
    }

    // Create payment invoice using Xendit API
    const response = await axios.post(
      'https://api.xendit.co/v2/invoices',
      {
        external_id: externalId,
        amount,
        description,
        customer: {
          given_names: customerDetails.name,
          email: customerDetails.email
        },
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
        currency: 'IDR',
        payment_methods: ['CREDIT_CARD', 'BCA', 'BNI', 'BRI', 'MANDIRI', 'OVO', 'DANA', 'LINKAJA', 'GOPAY']
      },
      {
        headers: {
          Authorization: `Basic ${btoa(settings.xendit_api_key + ':')}`
        }
      }
    );

    // Log payment creation
    await logPaymentHistory(response.data.id, 'CREATED', 'Payment invoice created successfully');

    // Add to payment queue
    await updatePaymentQueue(response.data.id, 'PENDING');

    // Notify admin about new payment
    await sendAdminNotification('NEW_PAYMENT', {
      payment_id: response.data.id,
      participant_id: externalId,
      amount,
      customer_name: customerDetails.name
    });

    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    
    // Log payment creation failure
    await logPaymentHistory(externalId, 'FAILED', `Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

    throw error;
  }
}

// Handle payment callback from Xendit webhook
export async function handlePaymentCallback(paymentId: string, status: string) {
  try {
    // Logging
    console.log('Handling payment callback for payment_id:', paymentId);
    console.log('Status:', status);

    // Validasi payment_id
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    // Validasi status pembayaran
    const validStatus = ['PAID', 'FAILED', 'PENDING', 'EXPIRED'];
    if (!validStatus.includes(status)) {
      throw new Error(`Invalid payment status: ${status}`);
    }

    // Log payment status update
    await logPaymentHistory(paymentId, status, `Payment status updated to ${status}`);

    // Update participant payment status
    const { data: participant, error: updateStatusError } = await supabase
      .from('participants')
      .update({
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId)
      .select('*')
      .single();

    if (updateStatusError) {
      throw updateStatusError;
    }

    // Pastikan update berhasil
    if (!participant) {
      throw new Error('Failed to update participant status');
    }

    // Validasi status pembayaran sebelumnya
    if (participant.payment_status !== status) {
      console.log(`Payment status changed from ${participant.payment_status} to ${status}`);
    }

    // Generate and send receipt only if status is PAID
    if (status === 'PAID') {
      // Generate and send receipt
      const { generateReceipt } = await import('./receipt');
      const { sendReceipt } = await import('./whatsapp');

      const { receiptUrl } = await generateReceipt({ participantId: participant.id });
      await sendReceipt({ 
        whatsappNumber: participant.whatsapp,
        receiptUrl 
      });

      // Notify admin about successful payment
      await sendAdminNotification('PAYMENT_SUCCESS', {
        payment_id: paymentId,
        participant_id: participant.id,
        amount: participant.amount,
        customer_name: participant.name
      });
    }

    // Update payment queue status
    await updatePaymentQueue(paymentId, 'PROCESSED');

    return { success: true };
  } catch (error) {
    console.error('Error handling payment callback:', error);

    // Log error
    await logPaymentHistory(paymentId, 'ERROR', `Error handling payment callback: ${error instanceof Error ? error.message : 'Unknown error'}`);

    throw error;
  }
}