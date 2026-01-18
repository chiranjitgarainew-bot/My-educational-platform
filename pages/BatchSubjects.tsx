import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Lock, ChevronRight, Zap, Activity, Atom, Star } from 'lucide-react';
import { getBatchById } from '../data';
import { userDb } from '../services/db';
import { User } from '../types';

const BatchSubjects: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({});
  
  const batch = getBatchById(batchId);
  
  useEffect(() => {
    const sessionUser = userDb.getSession();
    if (!sessionUser) {
        navigate('/');
        return;
    }
    setUser(sessionUser);

    const loadProgress = async () => {
        if (!batch) return;
        const progress: Record<string, number> = {};
        for (const sub of batch.subjects) {
            const p = await userDb.getSubjectProgress(sessionUser.id, batch.id, sub);
            progress[sub] = p;
        }
        setSubjectProgress(progress);
    };
    loadProgress();

  }, [batchId, navigate]);

  if (!batch || !user) return <div className="p-10 text-center">Loading...</div>;

  if (!user.enrolledBatches?.includes(batchId!)) {
      return (
          <div className="p-10 text-center">
              <Lock className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
              <button onClick={() => navigate(`/payment/${batchId}`)} className="mt-4 bg-primary text-white px-6 py-2 rounded-lg">Buy Now</button>
          </div>
      );
  }

  // Helper to get icon based on subject name
  const getSubjectIcon = (subjectName: string) => {
      if (subjectName.includes('Mathematics') || subjectName.includes('গণিত')) return <Zap size={32} />;
      if (subjectName.includes('Life Science') || subjectName.includes('জীবন')) return <Activity size={32} />;
      if (subjectName.includes('Physical') || subjectName.includes('ভৌত')) return <Atom size={32} />;
      return <Book size={32} />;
  };

  // Helper for unique colorful themes per card
  const getTheme = (index: number) => {
      const themes = [
          { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', gradient: 'from-rose-400 to-red-500', shadow: 'shadow-rose-500/20' },
          { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20' },
          { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
          { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20' },
          { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', gradient: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-500/20' },
      ];
      return themes[index % themes.length];
  };

  return (
    <div className="pb-20 bg-[#F3F4F6] min-h-screen">
       {/* Vibrant Header */}
       <div className="bg-white px-6 pt-8 pb-20 rounded-b-[40px] shadow-sm relative overflow-hidden">
         {/* Abstract shapes */}
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
         <div className="absolute top-[20%] left-[-10%] w-48 h-48 bg-pink-100 rounded-full blur-3xl opacity-60"></div>

         <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <button onClick={() => navigate('/classes')} className="p-3 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl hover:scale-105 transition shadow-sm text-gray-700">
                    <ArrowLeft size={22} />
                </button>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Star className="text-yellow-400 fill-current" size={24} />
                </div>
            </div>
            
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-wide border border-indigo-100 mb-3">
                BATCH: {batch.name}
            </span>
            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                {batch.batchName}
            </h1>
            <p className="text-gray-500 font-medium">Choose a subject to start learning.</p>
         </div>
       </div>

       <div className="px-5 -mt-12 relative z-20 space-y-5">
          {batch.subjects.map((subject, idx) => {
             const progress = subjectProgress[subject] || 0;
             const theme = getTheme(idx);

             return (
                 <div 
                    key={idx} 
                    onClick={() => navigate(`/batch/${batchId}/subject/${encodeURIComponent(subject)}`)}
                    className={`group relative bg-white rounded-3xl p-6 shadow-xl ${theme.shadow} border border-white hover:border-transparent transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                 >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    
                    {/* Decorative Circle */}
                    <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10 group-hover:scale-150 transition-transform duration-700`}></div>

                    <div className="relative z-10 flex items-center gap-5">
                        {/* 3D Floating Icon Box */}
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg flex items-center justify-center text-white transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300`}>
                            {getSubjectIcon(subject)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-gray-800 text-lg mb-1 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                                {subject}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium mb-3">Tap to view chapters</p>
                            
                            {/* Colorful Progress Bar */}
                            <div className="relative">
                                <div className="flex justify-between items-center text-[10px] font-bold mb-1.5">
                                    <span className="text-gray-400">COMPLETED</span>
                                    <span className={`${theme.text}`}>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center ${theme.text} opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300`}>
                            <ChevronRight size={20} />
                        </div>
                    </div>
                 </div>
             );
          })}
       </div>
    </div>
  );
};

export default BatchSubjects;