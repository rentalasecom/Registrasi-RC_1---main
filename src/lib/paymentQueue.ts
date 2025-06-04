import { supabase } from './supabase';
import { createPayment, handlePaymentCallback } from './xendit';
import { generateReceipt, sendReceipt } from './receipt';

interface PaymentQueueItem {
  id: string;
  payment_id: string;
  status: string;
  participant_id: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export class PaymentQueue {
  private static instance: PaymentQueue;
  private processing: boolean = false;
  private timeoutId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): PaymentQueue {
    if (!PaymentQueue.instance) {
      PaymentQueue.instance = new PaymentQueue();
    }
    return PaymentQueue.instance;
  }

  private async processQueue() {
    try {
      // Get pending payments from queue
      const { data: pendingPayments, error: fetchError } = await supabase
        .from('payment_queue')
        .select('*')
        .eq('status', 'PENDING')
        .lte('retry_count', 3)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching payment queue:', fetchError);
        return;
      }

      if (pendingPayments?.length) {
        console.log(`Processing ${pendingPayments.length} pending payments`);
        
        for (const payment of pendingPayments) {
          await this.processPayment(payment);
        }
      }

      // Schedule next check
      this.timeoutId = setTimeout(() => this.processQueue(), 30000); // Check every 30 seconds
    } catch (error) {
      console.error('Error processing payment queue:', error);
    }
  }

  private async processPayment(payment: PaymentQueueItem) {
    try {
      // Get payment status from Xendit
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_id', payment.payment_id)
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // Handle payment callback
      await handlePaymentCallback(paymentData.payment_id, paymentData.status);

      // Update queue status
      await supabase
        .from('payment_queue')
        .update({
          status: 'PROCESSED',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      console.log(`Successfully processed payment ${payment.payment_id}`);
    } catch (error) {
      console.error(`Error processing payment ${payment.payment_id}:`, error);

      // Increment retry count
      const { error: updateError } = await supabase
        .from('payment_queue')
        .update({
          retry_count: payment.retry_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Error updating retry count:', updateError);
      }
    }
  }

  public start() {
    if (!this.processing) {
      this.processing = true;
      this.processQueue();
    }
  }

  public stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      this.processing = false;
    }
  }
}

// Start the queue processor when the module is loaded
const queue = PaymentQueue.getInstance();
queue.start();
