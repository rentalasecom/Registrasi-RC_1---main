import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckSquare, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { useParticipants } from '../store/useParticipants';
import { createPayment } from '../lib/xendit';

interface RegistrationFormData {
  name: string;
  email: string;
  address: string;
  whatsapp: string;
  hardBodyNoWings: boolean;
  hardBodyWings: boolean;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { createParticipant } = useParticipants();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<RegistrationFormData>();
  
  const hardBodyNoWings = watch('hardBodyNoWings');
  const hardBodyWings = watch('hardBodyWings');
  
  // Update categories and price when selections change
  useEffect(() => {
    const selectedCategories: string[] = [];
    if (hardBodyNoWings) selectedCategories.push('Hard Body NoWings');
    if (hardBodyWings) selectedCategories.push('Hard Body Wings');
    
    setCategories(selectedCategories);
    
    // Calculate price based on number of categories
    const categoriesCount = selectedCategories.length;
    if (categoriesCount === 0) setPrice(0);
    else if (categoriesCount === 1) setPrice(150000);
    else setPrice(250000); // Discount for 2 categories
  }, [hardBodyNoWings, hardBodyWings]);
  
  const onSubmit = async (data: RegistrationFormData) => {
    if (categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create participant record
      const { success, participant, message } = await createParticipant({
        name: data.name,
        email: data.email,
        address: data.address,
        whatsapp: data.whatsapp,
        categories: categories,
        price: price,
        payment_status: 'UNPAID',
        souvenir_received: false
      });
      
      if (!success || !participant) {
        toast.error(message);
        return;
      }
      
      // Create payment request
      const paymentResult = await createPayment({
        amount: price,
        externalId: participant.id,
        description: `Registration for Race RC Adventure - ${categories.join(', ')}`,
        customerDetails: {
          name: data.name,
          email: data.email
        },
        successRedirectUrl: `${window.location.origin}/payment/success`,
        failureRedirectUrl: `${window.location.origin}/payment/failed`
      });
      
      // Update participant with payment ID
      await useParticipants.getState().updateParticipant(participant.id, {
        payment_id: paymentResult.id
      });
      
      // Redirect to payment page
      window.location.href = paymentResult.invoice_url;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to process registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Register for Race RC Adventure</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="address">
                  Address *
                </label>
                <textarea
                  id="address"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Enter your complete address"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="whatsapp">
                  WhatsApp Number *
                </label>
                <input
                  id="whatsapp"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 08123456789"
                  {...register('whatsapp', { 
                    required: 'WhatsApp number is required',
                    pattern: {
                      value: /^[0-9+]{10,15}$/,
                      message: 'Invalid phone number format'
                    }
                  })}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
                )}
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-3">
                  Select Categories *
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 mr-3"
                      {...register('hardBodyNoWings')}
                    />
                    <div>
                      <span className="font-medium">Hard Body NoWings</span>
                      <p className="text-sm text-gray-500">Remote control cars without aerodynamic wings</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 mr-3"
                      {...register('hardBodyWings')}
                    />
                    <div>
                      <span className="font-medium">Hard Body Wings</span>
                      <p className="text-sm text-gray-500">Remote control cars with aerodynamic wings</p>
                    </div>
                  </label>
                </div>
                
                {categories.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">Please select at least one category</p>
                )}
              </div>
              
              {/* Price Summary */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <DollarSign className="mr-2 text-red-600" size={20} />
                  Price Summary
                </h3>
                
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="flex items-center">
                        <CheckSquare className="mr-2 text-green-600" size={16} />
                        {category}
                      </span>
                      <span>
                        {categories.length === 1 
                          ? 'Rp 150.000' 
                          : index === 0 
                            ? 'Rp 150.000' 
                            : 'Rp 100.000'}
                      </span>
                    </div>
                  ))}
                  
                  {categories.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-red-600">Rp {price.toLocaleString('id-ID')}</span>
                      </div>
                      
                      {categories.length > 1 && (
                        <div className="text-sm text-green-600 text-right">
                          You save Rp 50.000!
                        </div>
                      )}
                    </>
                  )}
                  
                  {categories.length === 0 && (
                    <div className="text-gray-500 text-center py-2">
                      Select categories to see pricing
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || categories.length === 0}
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Registration;