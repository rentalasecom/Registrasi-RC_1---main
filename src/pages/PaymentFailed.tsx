import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Layout from '../components/Layout';

const PaymentFailed: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={48} className="text-red-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
            
            <p className="text-gray-600 mb-8">
              We're sorry, but there was an issue processing your payment. 
              Please try again or contact our support team for assistance.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/register"
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
              >
                Try Again
              </Link>
              
              <Link 
                to="/"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-md transition duration-300"
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

export default PaymentFailed;