const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://zzrnqnqhkalsiwxqeifw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipant() {
  try {
    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', '629a30df-d7ee-43c6-9da2-25c6ba186bc1')
      .single();

    if (error) throw error;
    console.log('Participant data:', participant);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkParticipant();
