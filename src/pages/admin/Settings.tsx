import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Globe, Key, MessageCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSettings } from '../../store/useSettings';

interface SettingsFormData {
  homepage_title: string;
  homepage_location: string;
  homepage_banner_url: string;
  xendit_api_key: string;
  whatsapp_api_key: string;
  whatsapp_template: string;
}

const Settings: React.FC = () => {
  const { settings, fetchSettings, updateSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values
  const defaultValues: SettingsFormData = {
    homepage_title: '',
    homepage_location: '',
    homepage_banner_url: '',
    xendit_api_key: '',
    whatsapp_api_key: '',
    whatsapp_template: ''
  };

  // Initialize form with settings if available
  const initialFormValues = settings || defaultValues;

  const methods = useForm<SettingsFormData>({
    defaultValues: initialFormValues,
    mode: 'onChange'
  });
  const { 
    register, 
    handleSubmit,
    formState: { errors },
    watch
  } = methods;
  
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      await fetchSettings();
      setIsLoading(false);
    };
    
    loadSettings();
  }, [fetchSettings]);
  
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      await fetchSettings();
      setIsLoading(false);
    };
    loadSettings();
  }, [fetchSettings]);

  // Reset form when settings change
  useEffect(() => {
    if (settings) {
      methods.reset(settings);
    }
  }, [settings, methods]);
  
  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    
    try {
      const { success, message } = await updateSettings(data);
      
      if (success) {
        toast.success(message);
        // Refresh settings after successful update
        await fetchSettings();
        // Reset form with new settings
        methods.reset(data);
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Globe size={24} className="text-red-600 mr-3" />
              <h2 className="text-xl font-bold">Homepage Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="homepage_title">
                  Event Title
                </label>
                <input
                  id="homepage_title"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.homepage_title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter event title"
                  {...register('homepage_title', {
                    required: 'Event title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' }
                  })}
                />
                {errors.homepage_title && (
                  <p className="text-red-500 text-sm mt-1">{errors.homepage_title.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="homepage_location">
                  Event Location
                </label>
                <input
                  id="homepage_location"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.homepage_location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter event location"
                  {...register('homepage_location', { required: 'Event location is required' })}
                />
                {errors.homepage_location && (
                  <p className="text-red-500 text-sm mt-1">{errors.homepage_location.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="homepage_banner_url">
                  Banner Image URL
                </label>
                <input
                  id="homepage_banner_url"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.homepage_banner_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter banner image URL"
                  {...register('homepage_banner_url', { required: 'Banner image URL is required' })}
                />
                {errors.homepage_banner_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.homepage_banner_url.message}</p>
                )}
                
                {/* Preview */}
                {(() => {
                  const bannerUrl = watch('homepage_banner_url', '');
                  return (settings?.homepage_banner_url || bannerUrl) && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">Banner Preview:</p>
                      <div className="h-40 bg-cover bg-center rounded-md" style={{ backgroundImage: `url(${bannerUrl || settings?.homepage_banner_url})` }}></div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Key size={24} className="text-red-600 mr-3" />
              <h2 className="text-xl font-bold">API Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="xendit_api_key">
                  Xendit API Key
                </label>
                <input
                  id="xendit_api_key"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.xendit_api_key ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Xendit API key"
                  {...register('xendit_api_key', { required: 'Xendit API key is required' })}
                />
                {errors.xendit_api_key && (
                  <p className="text-red-500 text-sm mt-1">{errors.xendit_api_key.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  This key will be used for payment processing. Keep it secure.
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="whatsapp_api_key">
                  WhatsApp API Key
                </label>
                <input
                  id="whatsapp_api_key"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.whatsapp_api_key ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter WhatsApp API key"
                  {...register('whatsapp_api_key', { required: 'WhatsApp API key is required' })}
                />
                {errors.whatsapp_api_key && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp_api_key.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <MessageCircle size={24} className="text-red-600 mr-3" />
              <h2 className="text-xl font-bold">Notification Settings</h2>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="whatsapp_template">
                WhatsApp Message Template
              </label>
              <textarea
                id="whatsapp_template"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.whatsapp_template ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Enter WhatsApp message template"
                {...register('whatsapp_template', { required: 'WhatsApp message template is required' })}
              />
              {errors.whatsapp_template && (
                <p className="text-red-500 text-sm mt-1">{errors.whatsapp_template.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Use {`{{receipt_url}}`} as a placeholder for the receipt URL.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
};

export default Settings;