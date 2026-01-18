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
import { User, RoutePath } from './types';
import { userDb } from './services/db';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
    <div className="bg-blue-50 p-6 rounded-full mb-4">
      <span className="text-4xl">🚧</span>
    </div>
    <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500">This feature is coming soon to Your study platform.</p>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionUser = userDb.getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
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

            <Route path={RoutePath.HELP} element={<Help />} />
            <Route path={RoutePath.PROFILE} element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path={RoutePath.SETTINGS} element={<Settings />} />
            
            {/* Admin Routes */}
            <Route path={RoutePath.ADMIN} element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to={RoutePath.HOME} />} />
            <Route path={RoutePath.ADMIN_UPLOAD} element={<Navigate to={RoutePath.ADMIN} />} />
            
            <Route path={RoutePath.PURCHASES} element={<PlaceholderPage title="Your Purchases" />} />
            <Route path={RoutePath.COMMUNITY} element={<PlaceholderPage title="Community Hub" />} />
            
            <Route path="*" element={<Navigate to={RoutePath.HOME} replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;