import { supabase } from './supabase';

async function checkSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }

    console.log('Settings:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSettings();
