import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Settings {
  homepage_title: string;
  homepage_location: string;
  homepage_banner_url: string;
  xendit_api_key: string;
  whatsapp_api_key: string;
  whatsapp_template: string;
}

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<{ success: boolean; message: string }>;
}

export const useSettings = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  
  fetchSettings: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (error) throw error;
      
      set({ settings: data });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateSettings: async (newSettings) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update(newSettings)
        .eq('id', 1);
      
      if (error) throw error;
      
      // Refresh settings
      const { data, error: refreshError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (refreshError) {
        console.error('Error refreshing settings:', refreshError);
        return { success: true, message: 'Settings updated successfully, but failed to refresh' };
      }
      
      set({ settings: data || null });
      
      return { success: true, message: 'Settings updated successfully' };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  }
}));