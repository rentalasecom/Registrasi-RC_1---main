import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useEffect } from 'react';

type Participant = Database['public']['Tables']['participants']['Row'];

interface ParticipantsState {
  participants: Participant[];
  isLoading: boolean;
  fetchParticipants: () => Promise<void>;
  createParticipant: (participant: Database['public']['Tables']['participants']['Insert']) => Promise<{ success: boolean; participant?: Participant; message: string }>;
  updateParticipant: (id: string, updates: Database['public']['Tables']['participants']['Update']) => Promise<{ success: boolean; message: string }>;
  searchParticipantByName: (name: string) => Promise<Participant[]>;
  confirmReRegistration: (id: string, participantNumber: string, representativeName?: string, representativeWa?: string) => Promise<{ success: boolean; message: string }>;
  confirmSouvenirReceived: (id: string) => Promise<{ success: boolean; message: string }>;
  subscribeToChanges: () => () => void;
  checkPaymentStatus: () => Promise<void>;
}

export const useParticipants = create<ParticipantsState>((set, get) => ({
  participants: [],
  isLoading: false,

  // Subscribe to Supabase Realtime changes
  subscribeToChanges: () => {
    const channel = supabase
      .channel('participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants'
        },
        (payload) => {
          console.log('Change received!', payload);
          // Update local state when changes occur
          get().fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },

  // Fungsi untuk memeriksa status pembayaran secara berkala
  checkPaymentStatus: async () => {
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('payment_status', 'UNPAID')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Periksa status pembayaran untuk setiap peserta yang belum dibayar
      for (const participant of participants) {
        if (participant.payment_id) {
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('status')
            .eq('id', participant.payment_id)
            .single();

          if (invoiceError) {
            console.error('Error checking invoice status:', invoiceError);
            continue;
          }

          if (invoice?.status === 'PAID') {
            // Update status peserta jika invoice sudah dibayar
            const { error: updateError } = await supabase
              .from('participants')
              .update({
                payment_status: 'PAID',
                updated_at: new Date().toISOString()
              })
              .eq('id', participant.id);

            if (updateError) {
              console.error('Error updating participant status:', updateError);
              continue;
            }

            // Update local state
            await get().fetchParticipants();
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  },

  fetchParticipants: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ participants: data || [] });
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  createParticipant: async (participant) => {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      const participantWithTimestamps = {
        ...participant,
        created_at: now,
        updated_at: now,
        payment_status: 'UNPAID',
        souvenir_received: false
      };
      
      const { data, error } = await supabase
        .from('participants')
        .insert(participantWithTimestamps)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const currentParticipants = get().participants;
      set({ participants: [data, ...currentParticipants] });
      
      return { success: true, participant: data, message: 'Participant created successfully' };
    } catch (error) {
      console.error('Error creating participant:', error);
      return { success: false, message: 'Failed to create participant' };
    }
  },
  
  updateParticipant: async (id, updates) => {
    try {
      // Add updated timestamp
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('participants')
        .update(updatesWithTimestamp)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      await get().fetchParticipants();
      
      return { success: true, message: 'Participant updated successfully' };
    } catch (error) {
      console.error('Error updating participant:', error);
      return { success: false, message: 'Failed to update participant' };
    }
  },
  
  searchParticipantByName: async (name) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .ilike('name', `%${name}%`);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error searching participants:', error);
      return [];
    }
  },
  
  confirmReRegistration: async (id, participantNumber, representativeName, representativeWa) => {
    try {
      const updates: Database['public']['Tables']['participants']['Update'] = {
        participant_number: participantNumber,
        updated_at: new Date().toISOString()
      };
      
      if (representativeName) updates.representative_name = representativeName;
      if (representativeWa) updates.representative_wa = representativeWa;
      
      const { error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      await get().fetchParticipants();
      
      return { success: true, message: 'Re-registration confirmed successfully' };
    } catch (error) {
      console.error('Error confirming re-registration:', error);
      return { success: false, message: 'Failed to confirm re-registration' };
    }
  },
  
  confirmSouvenirReceived: async (id) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({
          souvenir_received: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      await get().fetchParticipants();
      
      return { success: true, message: 'Souvenir receipt confirmed successfully' };
    } catch (error) {
      console.error('Error confirming souvenir receipt:', error);
      return { success: false, message: 'Failed to confirm souvenir receipt' };
    }
  }
}));