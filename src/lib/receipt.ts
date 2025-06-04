import { supabase } from './supabase';
import QRCode from 'qrcode.react';
import { renderToString } from 'react-dom/server';

interface GenerateReceiptArgs {
  participantId: string;
}

export async function generateReceipt({ participantId }: GenerateReceiptArgs) {
  try {
    // Get participant details
    const { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (!participant) {
      throw new Error('Participant not found');
    }

    // Generate QR code for the receipt
    const qrCodeSvg = renderToString(
      <QRCode
        value={`${window.location.origin}/reregistration?name=${encodeURIComponent(participant.name)}`}
        size={128}
        level="H"
      />
    );

    // Create receipt HTML
    const receiptHtml = `
      <html>
        <head>
          <title>Race RC Adventure Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .receipt { border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .details table { width: 100%; border-collapse: collapse; }
            .details table td { padding: 8px; border-bottom: 1px solid #eee; }
            .qrcode { text-align: center; margin: 20px 0; }
            .paid-stamp { position: relative; text-align: center; margin-top: 20px; }
            .paid-stamp span { display: inline-block; border: 4px solid #0a0; color: #0a0; padding: 10px 20px; font-size: 24px; font-weight: bold; transform: rotate(-15deg); border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>Race RC Adventure</h1>
              <h2>Official Receipt</h2>
            </div>
            
            <div class="details">
              <table>
                <tr><td><strong>Name:</strong></td><td>${participant.name}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${participant.email}</td></tr>
                <tr><td><strong>WhatsApp:</strong></td><td>${participant.whatsapp}</td></tr>
                <tr><td><strong>Categories:</strong></td><td>${participant.categories.join(', ')}</td></tr>
                <tr><td><strong>Amount Paid:</strong></td><td>Rp ${participant.price.toLocaleString('id-ID')}</td></tr>
                <tr><td><strong>Payment Status:</strong></td><td>${participant.payment_status}</td></tr>
                <tr><td><strong>Transaction Date:</strong></td><td>${new Date(participant.updated_at).toLocaleString()}</td></tr>
              </table>
            </div>
            
            <div class="qrcode">
              ${qrCodeSvg}
              <p>Scan this code at the re-registration desk</p>
            </div>
            
            <div class="paid-stamp">
              <span>LUNAS</span>
            </div>
          </div>
        </body>
      </html>
    `;

    // In a real implementation, you would save this HTML to a file storage service
    // and return the URL to the file. For this demo, we'll simulate that.
    const receiptUrl = `https://example.com/receipts/${participantId}.html`;
    const barcodeUrl = `https://example.com/barcodes/${participantId}.png`;

    // Update participant with receipt and barcode URLs
    await supabase
      .from('participants')
      .update({
        receipt_url: receiptUrl,
        barcode_url: barcodeUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);

    return { receiptUrl, barcodeUrl };
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
}