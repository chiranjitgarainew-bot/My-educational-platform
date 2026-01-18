import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Classes from './pages/Classes';
import BatchDetails from './pages/BatchDetails';
import Payment from './pages/Payment';
import BatchSubjects from './pages/BatchSubjects';
import SubjectChapters from './pages/SubjectChapters';
import ChapterLectures from './pages/ChapterLectures';
import VideoPlayer from './pages/VideoPlayer';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Purchases from './pages/Purchases';
import { User, RoutePath } from './types';
import { userDb } from './services/db';
import { seedClass8Data, seedClass9Data, seedClass10Data } from './services/seeder';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // 1. Check Session & Device ID
      const sessionUser = userDb.getSession();
      
      if (sessionUser) {
          // Immediately validate session on load
          const isValid = await userDb.validateSession();
          if (isValid) {
              setUser(sessionUser);
          } else {
              userDb.clearSession();
              setSessionError(true);
          }
      }
      
      // 2. Seed Data
      await seedClass8Data();
      await seedClass9Data();
      await seedClass10Data();
      
      setLoading(false);
    };

    initApp();

    // 3. Periodic Session Check (Single Device Enforcement)
    const interval = setInterval(async () => {
        if (user) {
            const isValid = await userDb.validateSession();
            if (!isValid) {
                handleLogout();
                setSessionError(true);
            }
        }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setSessionError(false);
  };

  const handleLogout = () => {
    userDb.clearSession();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    userDb.saveUser(updatedUser);
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-primary">Loading...</div>;
  }

  return (
    <HashRouter>
      {/* Session Expired Modal */}
      {sessionError && !user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
                  <p className="text-gray-500 text-sm mb-6">
                      You have been logged out because your account was accessed from another device. 
                      For security, only one active session is allowed.
                  </p>
                  <button 
                    onClick={() => setSessionError(false)} 
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
                  >
                      Dismiss & Log In
                  </button>
              </div>
          </div>
      )}

      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path={RoutePath.HOME} element={<Home user={user} />} />
            <Route path={RoutePath.CLASSES} element={<Classes />} />
            <Route path={RoutePath.CLASS_DETAILS} element={<BatchDetails />} />
            <Route path={RoutePath.PAYMENT} element={<Payment />} />
            
            {/* Learning Hierarchy Routes */}
            <Route path={RoutePath.BATCH_SUBJECTS} element={<BatchSubjects />} />
            <Route path={RoutePath.SUBJECT_CHAPTERS} element={<SubjectChapters />} />
            <Route path={RoutePath.CHAPTER_LECTURES} element={<ChapterLectures />} />
            <Route path={RoutePath.VIDEO_PLAYER} element={<VideoPlayer />} />

            {/* Social Routes */}
            <Route path={RoutePath.INBOX} element={<Inbox />} />
            <Route path={RoutePath.CHAT} element={<Chat />} />
            <Route path={RoutePath.COMMUNITY} element={<Community />} />

            <Route path={RoutePath.HELP} element={<Help />} />
            <Route path={RoutePath.PROFILE} element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path={RoutePath.SETTINGS} element={<Settings />} />
            
            {/* Admin Routes with Role Check */}
            <Route path={RoutePath.ADMIN} element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to={RoutePath.HOME} />} />
            <Route path={RoutePath.ADMIN_UPLOAD} element={<Navigate to={RoutePath.ADMIN} />} />
            
            <Route path={RoutePath.PURCHASES} element={<Purchases />} />
            
            <Route path="*" element={<Navigate to={RoutePath.HOME} replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;