import { supabase } from './supabase';

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .limit(1)
      .single();

    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }

    console.log('Successfully connected to Supabase!');
    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
}
