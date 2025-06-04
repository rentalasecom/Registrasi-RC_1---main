import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit, Download, FileDown, Search, X, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useParticipants } from '../../store/useParticipants';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface EditParticipantFormData {
  name: string;
  categories: string[];
  payment_status: 'PAID' | 'UNPAID';
}

const Participants: React.FC = () => {
  const { fetchParticipants, participants, updateParticipant, subscribeToChanges } = useParticipants();
  const [unsubscribe, setUnsubscribe] = useState<() => void>();
  
  useEffect(() => {
    const loadParticipants = async () => {
      setIsLoading(true);
      await fetchParticipants();
      setIsLoading(false);
    };
    
    // Subscribe to changes
    const unsubscribeFunc = subscribeToChanges();
    setUnsubscribe(unsubscribeFunc);
    
    loadParticipants();
    
    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc();
      }
    };
  }, [fetchParticipants, subscribeToChanges]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    setValue,
    formState: { errors } 
  } = useForm<EditParticipantFormData>();
  

  
  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.whatsapp.includes(searchTerm)
  );
  
  const handleEdit = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;
    
    setValue('name', participant.name);
    setValue('categories', participant.categories);
    setValue('payment_status', participant.payment_status);
    
    setEditingParticipant(participantId);
  };
  
  const handleCancelEdit = () => {
    setEditingParticipant(null);
    reset();
  };
  
  const handleUpdateParticipant = async (data: EditParticipantFormData) => {
    if (!editingParticipant) return;
    
    try {
      const { success, message } = await updateParticipant(editingParticipant, {
        name: data.name,
        categories: data.categories,
        payment_status: data.payment_status
      });
      
      if (success) {
        toast.success(message);
        setEditingParticipant(null);
        reset();
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      toast.error('Failed to update participant');
    }
  };
  
  const handlePrint = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;
    
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
            <p><strong>Name:</strong> ${participant.name}</p>
            <p><strong>Categories:</strong> ${participant.categories.join(', ')}</p>
          </div>
          
          <div class="participant-number">
            ${participant.participant_number || 'N/A'}
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
  
  const exportToExcel = async () => {
    setIsExporting(true);
    
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Participants');
      
      // Add headers
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'WhatsApp', key: 'whatsapp', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Categories', key: 'categories', width: 20 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Payment Status', key: 'payment_status', width: 15 },
        { header: 'Participant Number', key: 'participant_number', width: 15 },
        { header: 'Souvenir Received', key: 'souvenir_received', width: 15 },
        { header: 'Registration Date', key: 'created_at', width: 20 }
      ];
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data
      participants.forEach(participant => {
        worksheet.addRow({
          name: participant.name,
          email: participant.email,
          whatsapp: participant.whatsapp,
          address: participant.address,
          categories: participant.categories.join(', '),
          price: participant.price,
          payment_status: participant.payment_status,
          participant_number: participant.participant_number || 'Not assigned',
          souvenir_received: participant.souvenir_received ? 'Yes' : 'No',
          created_at: new Date(participant.created_at).toLocaleString()
        });
      });
      
      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `race-rc-adventure-participants-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Participant data exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export participant data');
    } finally {
      setIsExporting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Participants</h1>
        
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            onClick={exportToExcel}
            disabled={isExporting || isLoading}
          >
            <FileDown size={20} />
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Search by name, email, or WhatsApp"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading participants...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No participants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categories</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <React.Fragment key={participant.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-gray-500">{participant.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {participant.categories.map((category, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{participant.whatsapp}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm">Rp {participant.price.toLocaleString('id-ID')}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                            participant.payment_status === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participant.payment_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {participant.participant_number || 'Not assigned'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                          participant.souvenir_received 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.souvenir_received ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(participant.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                            onClick={() => handleEdit(participant.id)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:text-gray-800 transition"
                            onClick={() => handlePrint(participant.id)}
                            title="Print"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Edit Row */}
                    {editingParticipant === participant.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <form onSubmit={handleSubmit(handleUpdateParticipant)}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  {...register('name', { required: 'Name is required' })}
                                />
                                {errors.name && (
                                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Categories
                                </label>
                                <div className="space-y-2">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      value="Hard Body NoWings"
                                      className="mr-2"
                                      {...register('categories')}
                                    />
                                    <span className="text-sm">Hard Body NoWings</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      value="Hard Body Wings"
                                      className="mr-2"
                                      {...register('categories')}
                                    />
                                    <span className="text-sm">Hard Body Wings</span>
                                  </label>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Payment Status
                                </label>
                                <div className="space-y-2">
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      value="PAID"
                                      className="mr-2"
                                      {...register('payment_status')}
                                    />
                                    <span className="text-sm flex items-center">
                                      <CheckCircle size={16} className="text-green-600 mr-1" /> Paid
                                    </span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      value="UNPAID"
                                      className="mr-2"
                                      {...register('payment_status')}
                                    />
                                    <span className="text-sm flex items-center">
                                      <XCircle size={16} className="text-yellow-600 mr-1" /> Unpaid
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Participants;