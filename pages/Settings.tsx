import React, { useState, useEffect } from 'react';
import { User, Session } from '../types';
import { 
  Search, User as UserIcon, Shield, Lock, Bell, Moon, 
  CreditCard, Grid, Database, HelpCircle, ChevronRight, 
  Camera, Check, AlertTriangle, LogOut, Download, Trash2,
  Smartphone, Mail, Eye, EyeOff, Globe, Laptop, ArrowLeft
} from 'lucide-react';
import { userDb } from '../services/db';

// --- Shared UI Components ---

const Toggle = ({ checked, onChange, label, description }: any) => (
  <div className="flex items-center justify-between py-3">
    <div className="pr-4">
      <div className="font-medium text-gray-800">{label}</div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const SectionCard = ({ title, description, children, danger = false }: any) => (
  <div className={`bg-white rounded-xl shadow-sm border ${danger ? 'border-red-100' : 'border-gray-200'} overflow-hidden mb-6`}>
    <div className={`p-4 border-b ${danger ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
      <h3 className={`font-bold ${danger ? 'text-red-700' : 'text-gray-800'}`}>{title}</h3>
      {description && <p className={`text-sm mt-1 ${danger ? 'text-red-500' : 'text-gray-500'}`}>{description}</p>}
    </div>
    <div className="p-5 space-y-4">
      {children}
    </div>
  </div>
);

const Modal = ({ isOpen, title, children, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><LogOut className="rotate-45" size={20} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Settings Page Component ---

const Settings = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true); // For mobile drill-down
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [authModal, setAuthModal] = useState<{isOpen: boolean, action: () => void} | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Mock Sessions Data
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', device: 'Chrome on Windows', location: 'Kolkata, India', lastActive: 'Now', current: true },
    { id: '2', device: 'Safari on iPhone 13', location: 'Dhaka, Bangladesh', lastActive: '2 days ago', current: false },
  ]);

  useEffect(() => {
    const sessionUser = userDb.getSession();
    if (sessionUser) setUser(sessionUser);
    
    // Desktop check to ensure menu logic works
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
      else if (!activeTab) setIsMobileMenuOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (sectionName: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (user) userDb.saveUser(user);
      setLoading(false);
      showToast(`${sectionName} saved successfully`);
    }, 800);
  };

  const requireAuth = (callback: () => void) => {
    setAuthModal({ isOpen: true, action: callback });
  };

  const confirmAuth = () => {
    if (passwordConfirm === 'password') { // Mock password check
      authModal?.action();
      setAuthModal(null);
      setPasswordConfirm('');
      showToast('Action verified', 'success');
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  // Tabs Configuration
  const tabs = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Moon },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Grid },
    { id: 'data', label: 'Data Mgmt', icon: Database },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const filteredTabs = tabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render Content based on Active Tab
  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'account':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Profile Information" description="Update your personal details">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                  <button className="absolute bottom-0 right-0 p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50">
                    <Camera size={12} className="text-gray-600" />
                  </button>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Profile Photo</h4>
                  <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size 800K</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={user.username || ''} onChange={e => setUser({...user, username: e.target.value})} placeholder="@username" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <button onClick={() => handleSave('Profile')} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </SectionCard>

            <SectionCard title="Contact Info" description="Manage how we contact you">
               <div className="space-y-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex gap-2">
                      <input type="email" value={user.email} disabled className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
                      <span className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 rounded border border-green-100"><Check size={12} className="mr-1"/> Verified</span>
                    </div>
                 </div>
               </div>
            </SectionCard>

            <SectionCard title="Danger Zone" description="Irreversible actions" danger>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-red-700">Deactivate Account</h5>
                  <p className="text-xs text-red-500">Temporarily disable your account</p>
                </div>
                <button onClick={() => requireAuth(() => showToast('Account Deactivated', 'error'))} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">Deactivate</button>
              </div>
              <div className="border-t border-red-100 pt-4 flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-red-700">Delete Account</h5>
                  <p className="text-xs text-red-500">Permanently remove all data</p>
                </div>
                <button onClick={() => requireAuth(() => showToast('Account Scheduled for Deletion', 'error'))} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
              </div>
            </SectionCard>
          </div>
        );

      case 'security':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Authentication" description="Keep your account secure">
              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                       <h5 className="font-medium text-gray-900">Change Password</h5>
                       <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                    </div>
                    <button onClick={() => requireAuth(() => {})} className="text-primary text-sm font-medium hover:underline">Update</button>
                 </div>
                 <Toggle 
                   checked={user.twoFactorEnabled || false} 
                   onChange={(v: boolean) => setUser({...user, twoFactorEnabled: v})} 
                   label="Two-Factor Authentication" 
                   description="Add an extra layer of security"
                 />
              </div>
            </SectionCard>

            <SectionCard title="Active Sessions" description="Devices currently logged in">
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md shadow-sm">
                         {session.device.toLowerCase().includes('phone') ? <Smartphone size={18} /> : <Laptop size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{session.device} {session.current && <span className="text-xs text-green-600 bg-green-50 px-1 rounded ml-2">Current</span>}</p>
                        <p className="text-xs text-gray-500">{session.location} • {session.lastActive}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button onClick={() => setSessions(sessions.filter(s => s.id !== session.id))} className="text-gray-400 hover:text-red-500">
                        <LogOut size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="mt-4 text-sm text-red-600 font-medium hover:text-red-700 border border-red-200 px-4 py-2 rounded-lg w-full">Log Out All Devices</button>
            </SectionCard>
          </div>
        );

      case 'preferences':
        return (
          <div className="animate-fade-in">
             <SectionCard title="Appearance" description="Customize how the app looks">
                <div className="grid grid-cols-3 gap-4">
                   {['light', 'dark', 'system'].map((t) => (
                     <button 
                       key={t}
                       onClick={() => setUser({...user, theme: t as any})}
                       className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition ${user.theme === t ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                     >
                        {t === 'light' && <div className="w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm"></div>}
                        {t === 'dark' && <div className="w-8 h-8 bg-gray-800 rounded-full shadow-sm"></div>}
                        {t === 'system' && <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-800 rounded-full shadow-sm"></div>}
                        <span className="text-sm capitalize">{t}</span>
                     </button>
                   ))}
                </div>
             </SectionCard>
             <SectionCard title="Regional" description="Set your local preferences">
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                   <select 
                    value={user.language || 'en'} 
                    onChange={(e) => setUser({...user, language: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                   >
                     <option value="en">English (United States)</option>
                     <option value="bn">Bengali (Bangla)</option>
                     <option value="es">Spanish</option>
                   </select>
                 </div>
               </div>
             </SectionCard>
          </div>
        );

      case 'notifications':
        return (
           <div className="animate-fade-in">
              <SectionCard title="Notification Channels" description="Where can we reach you?">
                 <Toggle checked={true} onChange={() => {}} label="Push Notifications" description="Receive alerts on this device" />
                 <Toggle checked={true} onChange={() => {}} label="Email Notifications" description="Receive digests and updates via email" />
              </SectionCard>
              <SectionCard title="Activity" description="What do you want to hear about?">
                 <Toggle checked={true} onChange={() => {}} label="Class Reminders" />
                 <Toggle checked={true} onChange={() => {}} label="Tutor Replies" />
                 <Toggle checked={false} onChange={() => {}} label="Marketing & Promos" />
              </SectionCard>
           </div>
        );

      case 'billing':
        return (
          <div className="animate-fade-in">
             <SectionCard title="Current Plan" description="Manage your subscription">
               <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6 mb-4 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold">Free Plan</h3>
                    <p className="text-gray-300 mb-4">$0.00 / month</p>
                    <button className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-100">Upgrade to Pro</button>
                  </div>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
               </div>
               <div className="text-sm text-gray-500">
                  Next billing date: <span className="text-gray-900 font-medium">N/A</span>
               </div>
             </SectionCard>
             <SectionCard title="Payment Methods" description="Secure payment details">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                   <CreditCard className="text-gray-400 mb-2" size={32} />
                   <p className="text-gray-500 text-sm mb-3">No cards added yet</p>
                   <button className="text-primary font-medium text-sm hover:underline">Add Payment Method</button>
                </div>
             </SectionCard>
          </div>
        );
      
      // Default fallback for other tabs
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
             <div className="p-4 bg-gray-50 rounded-full mb-3">
               {tabs.find(t => t.id === activeTab)?.icon({ size: 32, className: 'text-gray-400' })}
             </div>
             <h3 className="text-lg font-bold text-gray-700">Settings for {tabs.find(t => t.id === activeTab)?.label}</h3>
             <p className="text-gray-500 text-sm">This section is currently under development.</p>
          </div>
        );
    }
  };

  // Mobile Menu View
  const MobileMenu = () => (
    <div className="space-y-2">
      <div className="relative mb-4">
        <input 
          type="text" 
          placeholder="Search settings..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
      </div>
      {filteredTabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            if (window.innerWidth < 768) setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
             activeTab === tab.id 
               ? 'bg-blue-50 text-primary border border-blue-100' 
               : 'bg-white text-gray-700 hover:bg-gray-50 border border-transparent'
          }`}
        >
           <div className="flex items-center gap-3">
             <tab.icon size={20} className={activeTab === tab.id ? 'text-primary' : 'text-gray-400'} />
             <span className="font-medium">{tab.label}</span>
           </div>
           <ChevronRight size={16} className="text-gray-300" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="pb-20">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-bounce-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Auth Modal */}
      <Modal isOpen={!!authModal} title="Security Verification" onClose={() => setAuthModal(null)}>
        <p className="text-gray-600 text-sm mb-4">Please enter your password to confirm this action.</p>
        <input 
          type="password" 
          placeholder="Enter password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 outline-none focus:border-primary"
        />
        <div className="flex justify-end gap-2">
           <button onClick={() => setAuthModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
           <button onClick={confirmAuth} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600">Confirm</button>
        </div>
      </Modal>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <div className="flex items-center text-sm text-gray-500 mt-1">
           <span>Settings</span> 
           <ChevronRight size={14} className="mx-1" />
           <span className="text-primary font-medium">{tabs.find(t => t.id === activeTab)?.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar (Desktop) / Menu (Mobile) */}
        <div className={`md:col-span-4 lg:col-span-3 ${!isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
           <MobileMenu />
        </div>

        {/* Content Area */}
        <div className={`md:col-span-8 lg:col-span-9 ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
          {/* Mobile Back Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden mb-4 flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900"
          >
            <ArrowLeft size={18} /> Back to Menu
          </button>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;