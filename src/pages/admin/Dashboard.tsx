import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, DollarSign, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useParticipants } from '../../store/useParticipants';

interface DashboardStats {
  totalParticipants: number;
  paidParticipants: number;
  unpaidParticipants: number;
  totalRevenue: number;
  recentParticipants: any[];
}

const Dashboard: React.FC = () => {
  const { fetchParticipants, participants } = useParticipants();
  const [stats, setStats] = useState<DashboardStats>({
    totalParticipants: 0,
    paidParticipants: 0,
    unpaidParticipants: 0,
    totalRevenue: 0,
    recentParticipants: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        await fetchParticipants();
        
        // Get recent participants
        const { data: recentParticipants, error } = await supabase
          .from('participants')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [fetchParticipants]);
  
  useEffect(() => {
    if (participants.length > 0) {
      const paidParticipants = participants.filter(p => p.payment_status === 'PAID');
      const unpaidParticipants = participants.filter(p => p.payment_status === 'UNPAID');
      const totalRevenue = paidParticipants.reduce((sum, p) => sum + p.price, 0);
      
      setStats({
        totalParticipants: participants.length,
        paidParticipants: paidParticipants.length,
        unpaidParticipants: unpaidParticipants.length,
        totalRevenue,
        recentParticipants: participants.slice(0, 5)
      });
    }
  }, [participants]);
  
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
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Participants</p>
                  <h2 className="text-2xl font-bold">{stats.totalParticipants}</h2>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Participants</p>
                  <h2 className="text-2xl font-bold">{stats.paidParticipants}</h2>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full mr-4">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unpaid Participants</p>
                  <h2 className="text-2xl font-bold">{stats.unpaidParticipants}</h2>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <DollarSign size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h2 className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</h2>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Participants */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Recent Registrations</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categories</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentParticipants.length > 0 ? (
                    stats.recentParticipants.map((participant) => (
                      <tr key={participant.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-gray-500">{participant.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {participant.categories.map((category: string, index: number) => (
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
                          Rp {participant.price.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                            participant.payment_status === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participant.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(participant.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        No recent registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;