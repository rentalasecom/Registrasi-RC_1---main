import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, CheckCircle, User, Phone } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useParticipants } from '../../store/useParticipants';
import { Database } from '../../types/database';

type Participant = Database['public']['Tables']['participants']['Row'];

interface SearchFormData {
  name: string;
}

interface ConfirmationFormData {
  participantNumber: string;
  representativeName?: string;
  representativeWa?: string;
}

const ReRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialName = searchParams.get('name') || '';
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  
  const { searchParticipantByName, confirmReRegistration, confirmSouvenirReceived } = useParticipants();
  
  const { 
    register: registerSearch, 
    handleSubmit: handleSearchSubmit,
    setValue: setSearchValue,
    formState: { errors: searchErrors }
  } = useForm<SearchFormData>({
    defaultValues: {
      name: initialName
    }
  });
  
  const { 
    register: registerConfirmation, 
    handleSubmit: handleConfirmationSubmit,
    formState: { errors: confirmationErrors }
  } = useForm<ConfirmationFormData>();
  
  // If initialName is provided, search immediately
  React.useEffect(() => {
    if (initialName) {
      handleSearch({ name: initialName });
    }
  }, [initialName]);
  
  const handleSearch = async (data: SearchFormData) => {
    setIsSearching(true);
    setSelectedParticipant(null);
    
    try {
      const results = await searchParticipantByName(data.name);
      setParticipants(results);
      
      if (results.length === 0) {
        toast.error('No participants found with that name');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for participants');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
  };
  
  const handleConfirmation = async (data: ConfirmationFormData) => {
    if (!selectedParticipant) return;
    
    setIsSubmitting(true);
    
    try {
      const { success, message } = await confirmReRegistration(
        selectedParticipant.id,
        data.participantNumber,
        data.representativeName,
        data.representativeWa
      );
      
      if (success) {
        toast.success(message);
        // Refresh participant data
        const results = await searchParticipantByName(selectedParticipant.name);
        setParticipants(results);
        
        // Find and select the updated participant
        const updatedParticipant = results.find(p => p.id === selectedParticipant.id);
        if (updatedParticipant) {
          setSelectedParticipant(updatedParticipant);
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error('Error confirming re-registration');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleConfirmSouvenirReceived = async () => {
    if (!selectedParticipant) return;
    
    setIsSubmitting(true);
    
    try {
      const { success, message } = await confirmSouvenirReceived(selectedParticipant.id);
      
      if (success) {
        toast.success(message);
        // Refresh participant data
        const results = await searchParticipantByName(selectedParticipant.name);
        setParticipants(results);
        
        // Find and select the updated participant
        const updatedParticipant = results.find(p => p.id === selectedParticipant.id);
        if (updatedParticipant) {
          setSelectedParticipant(updatedParticipant);
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error('Souvenir confirmation error:', error);
      toast.error('Error confirming souvenir receipt');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePrint = () => {
    if (!selectedParticipant) return;
    
    // Create a printable HTML content
    const printContent = `
      <html>
        <head>
          <title>Race RC Adventure - Participant</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .participant-info { margin-bottom: 20px; }
            .participant-info p { margin: 5px 0; }
            .participant-number { font-size: 72px; text-align: center; font-weight: bold; margin: 30px 0; }
          </style>
        </head>
        <body>
          <h1>Race RC Adventure</h1>
          
          <div class="participant-info">
            <p><strong>Name:</strong> ${selectedParticipant.name}</p>
            <p><strong>Categories:</strong> ${selectedParticipant.categories.join(', ')}</p>
          </div>
          
          <div class="participant-number">
            ${selectedParticipant.participant_number || 'N/A'}
          </div>
        </body>
      </html>
    `;
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    } else {
      toast.error('Please allow pop-ups to print');
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-8">Re-Registration / Confirmation</h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Search Participant</h2>
          
          <form onSubmit={handleSearchSubmit(handleSearch)}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    searchErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter participant name"
                  {...registerSearch('name', { required: 'Name is required' })}
                />
                {searchErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{searchErrors.name.message}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center justify-center"
                disabled={isSearching}
              >
                <Search size={20} className="mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Participant List */}
        {participants.length > 0 && !selectedParticipant && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            
            <div className="space-y-4">
              {participants.map((participant) => (
                <div 
                  key={participant.id}
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => handleSelectParticipant(participant)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{participant.name}</h3>
                      <p className="text-sm text-gray-600">{participant.email}</p>
                      <p className="text-sm text-gray-600">Categories: {participant.categories.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        participant.payment_status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {participant.payment_status}
                      </span>
                      
                      {participant.participant_number && (
                        <p className="text-sm font-medium mt-2">
                          Number: {participant.participant_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Participant Details */}
        {selectedParticipant && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Participant Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-sm"
                onClick={() => setSelectedParticipant(null)}
              >
                Back to results
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-bold mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedParticipant.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedParticipant.email}</p>
                  <p><span className="font-medium">WhatsApp:</span> {selectedParticipant.whatsapp}</p>
                  <p><span className="font-medium">Address:</span> {selectedParticipant.address}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Registration Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Categories:</span> {selectedParticipant.categories.join(', ')}</p>
                  <p><span className="font-medium">Price:</span> Rp {selectedParticipant.price.toLocaleString('id-ID')}</p>
                  <p>
                    <span className="font-medium">Payment Status:</span>
                    <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      selectedParticipant.payment_status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedParticipant.payment_status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Souvenir Status:</span>
                    <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      selectedParticipant.souvenir_received 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedParticipant.souvenir_received ? 'Received' : 'Not Received'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Re-registration form */}
            {selectedParticipant.payment_status === 'PAID' && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-bold mb-4">Re-Registration Form</h3>
                
                <form onSubmit={handleConfirmationSubmit(handleConfirmation)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="participantNumber">
                        Participant Number *
                      </label>
                      <input
                        id="participantNumber"
                        type="text"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          confirmationErrors.participantNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter participant number"
                        defaultValue={selectedParticipant.participant_number || ''}
                        {...registerConfirmation('participantNumber', { required: 'Participant number is required' })}
                      />
                      {confirmationErrors.participantNumber && (
                        <p className="text-red-500 text-sm mt-1">{confirmationErrors.participantNumber.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="representativeName">
                        Representative Name (Optional)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                          <User size={18} />
                        </span>
                        <input
                          id="representativeName"
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="If someone else is collecting"
                          defaultValue={selectedParticipant.representative_name || ''}
                          {...registerConfirmation('representativeName')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="representativeWa">
                        Representative WhatsApp (Optional)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                          <Phone size={18} />
                        </span>
                        <input
                          id="representativeWa"
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Representative's WhatsApp"
                          defaultValue={selectedParticipant.representative_wa || ''}
                          {...registerConfirmation('representativeWa')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Re-Registration'}
                    </button>
                    
                    <button
                      type="button"
                      className={`font-bold py-2 px-6 rounded-md transition duration-300 flex-1 flex justify-center items-center ${
                        selectedParticipant.souvenir_received 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      onClick={handleConfirmSouvenirReceived}
                      disabled={selectedParticipant.souvenir_received || isSubmitting}
                    >
                      <CheckCircle size={20} className="mr-2" />
                      {selectedParticipant.souvenir_received ? 'Souvenir Received' : 'Confirm Souvenir Receipt'}
                    </button>
                    
                    <button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-300"
                      onClick={handlePrint}
                    >
                      Print
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {selectedParticipant.payment_status !== 'PAID' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800 font-medium">
                  This participant has not completed payment. Re-registration is only available for paid participants.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReRegistration;