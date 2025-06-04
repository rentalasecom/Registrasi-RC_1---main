import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'superadmin';
  } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  
  login: async (email, password) => {
    try {
      // In a real implementation, you would use Supabase Auth
      // This is a simplified version for demo purposes
      const { data, error } = await supabase
        .from('admins')
        .select('id, name, email, password_hash, role')
        .eq('email', email)
        .single();
      
      if (error || !data) {
        return { success: false, message: 'Invalid email or password' };
      }
      
      // In a real implementation, you would use bcrypt to compare passwords
      // This is a simplified check for demo purposes
      if (data.password_hash !== password) {
        return { success: false, message: 'Invalid email or password' };
      }
      
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as 'admin' | 'superadmin'
      };
      
      // Save user to local storage
      localStorage.setItem('raceRcUser', JSON.stringify(user));
      
      set({ user });
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  },
  
  logout: async () => {
    localStorage.removeItem('raceRcUser');
    set({ user: null });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('raceRcUser');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));