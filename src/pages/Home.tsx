import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../store/useSettings';
import { Trophy, Calendar, MapPin, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { checkSupabaseConnection } from '../lib/supabase-check';

const Home: React.FC = () => {
  const { settings, fetchSettings } = useSettings();
  
  useEffect(() => {
    fetchSettings();
    checkSupabaseConnection();
  }, [fetchSettings]);
  
  return (
    <Layout>
      {/* Hero Banner */}
      <section 
        className="bg-cover bg-center h-[70vh] relative"
        style={{ 
          backgroundImage: `url(${settings?.homepage_banner_url || 'https://images.pexels.com/photos/163509/toy-car-rally-rc-model-163509.jpeg'})` 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {settings?.homepage_title || 'Race RC Adventure'}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Experience the thrill of remote control racing!
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>
      
      {/* Event Details */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Event Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-xl font-bold mb-2">Date & Time</h3>
              <p>July 15, 2025</p>
              <p>8:00 AM - 5:00 PM</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <MapPin size={48} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-xl font-bold mb-2">Location</h3>
              <p>{settings?.homepage_location || 'Jakarta, Indonesia'}</p>
              <p>RC Racing Circuit</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Trophy size={48} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-xl font-bold mb-2">Categories</h3>
              <p>Hard Body NoWings</p>
              <p>Hard Body Wings</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Registration Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-600 text-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
                <p className="text-lg mb-4">
                  Register now to secure your spot in the Race RC Adventure competition!
                </p>
                <ul className="list-disc list-inside mb-6">
                  <li>Single category: Rp 150.000</li>
                  <li>Two categories: Rp 250.000</li>
                  <li>Special discounts for multiple categories</li>
                  <li>Receive souvenirs and race materials</li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center">
                <Users size={48} className="mb-4" />
                <Link 
                  to="/register" 
                  className="inline-block bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 text-center h-full">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-2">Register Online</h3>
                <p>Fill out the registration form and select your categories</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 17L18 12L13 7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12L18 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 text-center h-full">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-2">Make Payment</h3>
                <p>Pay securely through our integrated payment system</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 17L18 12L13 7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12L18 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 text-center h-full">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-2">Receive Receipt</h3>
                <p>Get your digital receipt with QR code via WhatsApp</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 17L18 12L13 7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12L18 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center h-full">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                <h3 className="text-xl font-bold mb-2">Re-Register on Event Day</h3>
                <p>Confirm your attendance and receive your race number</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;