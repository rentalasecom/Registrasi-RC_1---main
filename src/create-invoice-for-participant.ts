import { supabase } from './supabase';
import { createPayment } from './xendit';

async function createInvoiceForParticipant(participantId: string) {
  try {
    // Get participant data
    const { data: participant, error: getError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (getError) throw getError;
    if (!participant) throw new Error('Participant not found');

    console.log('Creating invoice for participant:', participant.name);

    // Create payment invoice
    const invoice = await createPayment({
      amount: participant.price,
      externalId: participant.id,
      description: 'Pembayaran Registrasi ' + participant.name,
      customerDetails: {
        name: participant.name,
        email: participant.email,
        whatsapp: participant.whatsapp
      },
      successRedirectUrl: 'https://example.com/success',
      failureRedirectUrl: 'https://example.com/failure'
    });

    console.log('Invoice created successfully:', invoice);
    console.log('Payment ID:', invoice.id);
    console.log('Invoice URL:', invoice.invoice_url);

    // Update participant with payment_id
    const { error: updateError } = await supabase
      .from('participants')
      .update({ payment_id: invoice.id })
      .eq('id', participantId);

    if (updateError) {
      console.error('Error updating participant payment_id:', updateError);
    } else {
      console.log('Participant payment_id updated successfully');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// ID peserta yang sudah ada
const participantId = '629a30df-d7ee-43c6-9da2-25c6ba186bc1';
createInvoiceForParticipant(participantId);
