import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { handlePaymentCallback } from '../lib/xendit';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('external_id');
  
  useEffect(() => {
    if (paymentId) {
      // Process the successful payment
      handlePaymentCallback(paymentId, 'PAID').catch(console.error);
    }
  }, [paymentId]);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            
            <p className="text-gray-600 mb-8">
              Thank you for registering for Race RC Adventure. Your payment has been successfully processed. 
              A receipt has been sent to your WhatsApp number.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/"
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;