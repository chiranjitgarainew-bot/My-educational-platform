import React from 'react';
import { RoutePath, User } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home, BookOpen, Settings, HelpCircle, LogOut, Database, Upload } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: RoutePath) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: RoutePath.HOME },
    { icon: BookOpen, label: 'Classes', path: RoutePath.CLASSES },
    { icon: Settings, label: 'Settings', path: RoutePath.SETTINGS },
    { icon: HelpCircle, label: 'Help (AI Tutor)', path: RoutePath.HELP },
  ];

  // Add Admin Links if user is admin
  if (user.role === 'admin') {
    menuItems.push(
      { icon: Upload, label: 'Upload Class', path: RoutePath.ADMIN_UPLOAD },
      { icon: Database, label: 'User Database', path: RoutePath.ADMIN }
    );
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header / Profile Area */}
          <div className="bg-primary p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center mt-4">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover mb-3"
              />
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-blue-100 text-sm">{user.email}</p>
              <span className="mt-2 px-2 py-0.5 bg-white/20 rounded text-xs uppercase tracking-wider font-semibold border border-white/40">
                {user.role}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      isActive 
                        ? 'bg-blue-50 text-primary' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;