require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaymentStatus() {
  try {
    // Get participant data
    const { data: participant, error: getError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', '629a30df-d7ee-43c6-9da2-25c6ba186bc1')
      .single();

    if (getError) throw getError;
    if (!participant) throw new Error('Participant not found');

    console.log('Payment Status:', participant.payment_status);
    console.log('Payment ID:', participant.payment_id);
    console.log('Receipt URL:', participant.receipt_url);
    console.log('Last Updated:', participant.updated_at);

    // Check payment history
    const { data: history, error: historyError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('payment_id', participant.payment_id)
      .order('timestamp', { ascending: false });

    if (historyError) throw historyError;

    console.log('\nPayment History:');
    history.forEach((entry, index) => {
      console.log(`${index + 1}. Status: ${entry.status}, Timestamp: ${entry.timestamp}, Notes: ${entry.notes}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Check status every 5 seconds
async function checkStatusContinuously() {
  console.log('Checking payment status continuously... (Press Ctrl+C to stop)');
  while (true) {
    await checkPaymentStatus();
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

checkStatusContinuously();
