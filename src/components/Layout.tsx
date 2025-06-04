import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Menu, X } from 'lucide-react';
import { useSettings } from '../store/useSettings';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { settings } = useSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 bg-[#f3c368] text-black shadow-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Trophy size={24} />
            <span className="text-xl font-bold">{settings?.homepage_title || 'Race RC Adventure'}</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <Link 
              to="/" 
              className={`hover:text-gray-200 transition ${
                location.pathname === '/' ? 'font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/register" 
              className={`hover:text-gray-200 transition ${
                location.pathname === '/register' ? 'font-bold' : ''
              }`}
            >
              Registration
            </Link>
          </nav>
          <div className="flex items-center gap-4 ml-4">
            <a href="/admin/login" className="hover:text-gray-200 transition">
              Login
            </a>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {menuOpen && (
          <div className="md:hidden bg-red-700 py-2">
            <div className="container mx-auto px-4 flex flex-col">
              <Link 
                to="/" 
                className={`py-2 hover:text-gray-200 transition ${
                  location.pathname === '/' ? 'font-bold' : ''
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/register" 
                className={`py-2 hover:text-gray-200 transition ${
                  location.pathname === '/register' ? 'font-bold' : ''
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Registration
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Trophy size={20} />
              <span className="font-bold">{settings?.homepage_title || 'Race RC Adventure'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span>
                <a href="/admin/login" className="hover:underline">
                  Admin Login
                </a>
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Race RC Adventure. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;