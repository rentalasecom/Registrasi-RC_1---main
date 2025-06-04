import { createPayment } from './xendit';

async function createTestInvoice() {
  try {
    const invoice = await createPayment({
      amount: 100000, // Contoh jumlah pembayaran
      externalId: 'TEST-INV-' + Date.now(), // ID unik untuk invoice
      description: 'Test Payment Invoice',
      customerDetails: {
        name: 'Test User',
        email: 'test@example.com',
        whatsapp: '+6281234567890'
      },
      successRedirectUrl: 'https://example.com/success',
      failureRedirectUrl: 'https://example.com/failure'
    });

    console.log('Invoice created successfully:', invoice);
    console.log('Payment ID:', invoice.id);
    console.log('Invoice URL:', invoice.invoice_url);
  } catch (error) {
    console.error('Error creating invoice:', error);
  }
}

createTestInvoice();
