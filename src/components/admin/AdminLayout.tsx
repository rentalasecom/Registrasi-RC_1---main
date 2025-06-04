import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Settings, LayoutDashboard, 
  LogOut, Menu, X, ChevronDown, ChevronUp, UserCheck 
} from 'lucide-react';
import { useAuth } from '../../store/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy size={24} />
            <span className="text-xl font-bold">Race RC Admin</span>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="flex items-center gap-2 text-sm"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span>{user?.name}</span>
                {profileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user?.email}
                    <div className="text-xs text-gray-500">
                      Role: {user?.role}
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            
            <button 
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-grow">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-64 bg-gray-800 text-white">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                    location.pathname === '/admin/dashboard' ? 'bg-gray-700' : ''
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/participants" 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                    location.pathname === '/admin/participants' ? 'bg-gray-700' : ''
                  }`}
                >
                  <Users size={20} />
                  <span>Participants</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/reregistration" 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                    location.pathname === '/admin/reregistration' ? 'bg-gray-700' : ''
                  }`}
                >
                  <UserCheck size={20} />
                  <span>Re-Registration</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/settings" 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                    location.pathname === '/admin/settings' ? 'bg-gray-700' : ''
                  }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </li>
              <li className="pt-4 mt-4 border-t border-gray-700">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded-md text-red-400 hover:bg-gray-700 transition w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Mobile navigation */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 md:hidden">
            <div className="h-full w-64 bg-gray-800 text-white p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/admin/dashboard" 
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                      location.pathname === '/admin/dashboard' ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/participants" 
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                      location.pathname === '/admin/participants' ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Users size={20} />
                    <span>Participants</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/reregistration" 
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                      location.pathname === '/admin/reregistration' ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCheck size={20} />
                    <span>Re-Registration</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/settings" 
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition ${
                      location.pathname === '/admin/settings' ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings size={20} />
                    <span>Settings</span>
                  </Link>
                </li>
                <li className="pt-4 mt-4 border-t border-gray-700">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 rounded-md text-red-400 hover:bg-gray-700 transition w-full text-left"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;