import axios from 'axios';
import { supabase } from './supabase';

interface SendReceiptArgs {
  whatsappNumber: string;
  receiptUrl: string;
}

export async function sendReceipt({ whatsappNumber, receiptUrl }: SendReceiptArgs) {
  try {
    // Get WhatsApp API key and template from settings
    const { data: settings } = await supabase
      .from('settings')
      .select('whatsapp_api_key, whatsapp_template')
      .single();

    if (!settings?.whatsapp_api_key || !settings?.whatsapp_template) {
      throw new Error('WhatsApp API key or template not configured');
    }

    // Format WhatsApp number (remove any + or leading 0 and add country code if needed)
    const formattedNumber = whatsappNumber.startsWith('+') 
      ? whatsappNumber.substring(1) 
      : whatsappNumber.startsWith('0') 
        ? '62' + whatsappNumber.substring(1) 
        : whatsappNumber;

    // Replace template placeholder with actual receipt URL
    const message = settings.whatsapp_template.replace('{{receipt_url}}', receiptUrl);

    // In a production environment, this would be a server-side call
    // This is simplified for demo purposes
    const response = await axios.post(
      'https://api.whatsapp.com/send',
      {
        phone: formattedNumber,
        text: message
      },
      {
        headers: {
          Authorization: `Bearer ${settings.whatsapp_api_key}`
        }
      }
    );

    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}