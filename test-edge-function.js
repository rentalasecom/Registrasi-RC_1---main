const axios = require('axios');

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cm5xbnFoa2Fsc2l3eHFlaWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU5ODkxMSwiZXhwIjoyMDY0MTc0OTExfQ.ZpZ80JWUHvEiybH6loP1GobSBSw8l2R210NvNMdHCt4';
const webhookToken = 'PDtA0Ivv0iX3RBYOR62t1YFHQVeghhvMXa94Ov5diT1PSWAb';

const testPayment = {
  payment_id: '683ec66aa0ee90c011587f4e',
  status: 'PAID'
};

const body = JSON.stringify(testPayment);
const signature = Buffer.from(body + ':' + webhookToken).toString('base64');

axios.post('https://zzrnqnqhkalsiwxqeifw.supabase.co/functions/v1/payment-callback', 
  body,
  {
    headers: {
      'authorization': `Bearer ${supabaseAnonKey}`,
      'x-xendit-signature': signature,
      'Content-Type': 'application/json'
    }
  }
)
.then(response => {
  console.log('Response:', response.data);
})
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});
