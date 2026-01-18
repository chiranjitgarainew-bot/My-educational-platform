import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, RoutePath } from '../types';
import Sidebar from './Sidebar';
import { Menu, Bell, Home, ShoppingBag, Users, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const footerItems = [
    { icon: Home, label: 'Home', path: RoutePath.HOME },
    { icon: ShoppingBag, label: 'Purchases', path: RoutePath.PURCHASES },
    { icon: Users, label: 'Community', path: RoutePath.COMMUNITY },
    { icon: UserIcon, label: 'Profile', path: RoutePath.PROFILE },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-xl font-bold text-primary tracking-tight">Your study platform</h1>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition relative">
            <Bell size={24} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => navigate(RoutePath.PROFILE)}>
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-gray-300 object-cover"
            />
          </button>
        </div>
      </header>

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
        <div className="flex justify-around items-center max-w-3xl mx-auto">
          {footerItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-4 w-full transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;