require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Konfigurasi Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createInvoice() {
  try {
    // Get participant data
    const { data: participant, error: getError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', '629a30df-d7ee-43c6-9da2-25c6ba186bc1')
      .single();

    if (getError) throw getError;
    if (!participant) throw new Error('Participant not found');

    console.log('Creating invoice for participant:', participant.name);

    // Get Xendit API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('xendit_api_key')
      .eq('id', 1)
      .single();

    if (settingsError) throw settingsError;
    if (!settings?.xendit_api_key) throw new Error('Xendit API key not found');

    // Create payment invoice using Xendit API
    const response = await axios.post(
      'https://api.xendit.co/v2/invoices',
      {
        external_id: participant.id,
        amount: participant.price,
        description: 'Pembayaran Registrasi ' + participant.name,
        customer: {
          given_names: participant.name,
          email: participant.email
        },
        success_redirect_url: 'https://example.com/success',
        failure_redirect_url: 'https://example.com/failure',
        currency: 'IDR',
        payment_methods: ['CREDIT_CARD', 'BCA', 'BNI', 'BRI', 'MANDIRI', 'OVO', 'DANA', 'LINKAJA', 'GOPAY']
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(settings.xendit_api_key + ':').toString('base64')}`
        }
      }
    );

    console.log('Invoice created successfully:', response.data);
    console.log('Payment ID:', response.data.id);
    console.log('Invoice URL:', response.data.invoice_url);

    // Update participant with payment_id
    const { error: updateError } = await supabase
      .from('participants')
      .update({ payment_id: response.data.id })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Error updating participant payment_id:', updateError);
    } else {
      console.log('Participant payment_id updated successfully');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createInvoice();
