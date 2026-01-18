import React, { useEffect, useState } from 'react';
import { User, ClassContent, ProgressRecord } from '../types';
import { PlayCircle, Clock, Award, ChevronRight, BarChart2, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { userDb } from '../services/db';

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [recentHistory, setRecentHistory] = useState<{content: ClassContent, progress: ProgressRecord}[]>([]);
  const [stats, setStats] = useState({ totalHours: 0, completedLessons: 0 });
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoadingHistory(true);
    const history = await userDb.getRecentHistory(user.id, 5);
    setRecentHistory(history);

    const allProgress = await userDb.getAllUserProgress(user.id);
    const totalSeconds = allProgress.reduce((acc, curr) => acc + curr.watchedSeconds, 0);
    const completed = allProgress.filter(p => p.completed).length;
    
    setStats({
      totalHours: Math.round(totalSeconds / 3600),
      completedLessons: completed
    });
    setLoadingHistory(false);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Modern Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 shadow-2xl shadow-indigo-500/20 animate-fade-in-up">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10 animate-float"></div>
        
        <div className="relative z-10 text-white">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight">
                        Hello, {user.name.split(' ')[0]}! <span className="inline-block animate-bounce">👋</span>
                    </h1>
                    <p className="text-indigo-100 text-sm font-medium opacity-90 max-w-xs leading-relaxed">
                        Ready to level up your skills today? Let's dive back into learning.
                    </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg">
                    <Sparkles className="text-yellow-300" size={24} />
                </div>
            </div>
            
            <div className="mt-8 flex gap-3">
                <button 
                onClick={() => navigate(RoutePath.CLASSES)}
                className="bg-white text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                >
                <PlayCircle size={18} /> Browse Batches
                </button>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-glow hover:border-indigo-100 border border-transparent transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                <Clock size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800">{stats.totalHours}h</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Watch Time</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-glow hover:border-violet-100 border border-transparent transition-all duration-300 group">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                <Award size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800">{stats.completedLessons}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Lessons Done</p>
            </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      {recentHistory.length > 0 && (
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex justify-between items-center mb-5 px-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span> Continue Watching
            </h2>
          </div>
          
          <div className="flex overflow-x-auto gap-5 pb-8 -mx-4 px-4 scrollbar-hide snap-x pt-2">
             {recentHistory.map(({ content, progress }, idx) => {
                 const percent = Math.min(100, (progress.watchedSeconds / progress.totalSeconds) * 100);
                 
                 return (
                    <div 
                        key={content.id}
                        onClick={() => navigate(`/player/${content.id}`)}
                        className="min-w-[280px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 snap-center group"
                        style={{animationDelay: `${idx * 0.1}s`}}
                    >
                        {/* Thumbnail Simulation */}
                        <div className="h-36 bg-slate-900 relative overflow-hidden">
                             <img 
                               src={`https://img.youtube.com/vi/${content.videoUrl.split('/').pop()?.split('?')[0]}/mqdefault.jpg`} 
                               alt={content.title}
                               className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                               onError={(e) => {
                                   (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/1e293b/FFF?text=Video';
                               }}
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 shadow-lg">
                                     <Play size={20} fill="currentColor" className="ml-1" />
                                 </div>
                             </div>
                             <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] text-white font-bold border border-white/10">
                                 {Math.floor(progress.totalSeconds / 60)} min
                             </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{content.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{content.subject} • Chapter {content.chapterId ? 'View' : '1'}</p>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${percent}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600">{Math.round(percent)}%</span>
                            </div>
                        </div>
                    </div>
                 );
             })}
          </div>
        </div>
      )}

      {/* My Batches Progress */}
      {user.enrolledBatches && user.enrolledBatches.length > 0 && (
         <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
             <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span> My Batches
             </h2>
             <div className="space-y-4">
                {user.enrolledBatches.map(batchId => (
                    <BatchProgressCard key={batchId} batchId={batchId} userId={user.id} />
                ))}
             </div>
         </div>
      )}
    </div>
  );
};

const BatchProgressCard: React.FC<{ batchId: string, userId: string }> = ({ batchId, userId }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const getP = async () => {
            const p = await userDb.getBatchProgress(userId, batchId);
            setProgress(p);
        }
        getP();
    }, [batchId, userId]);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                        className="text-slate-100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="text-indigo-500 drop-shadow-md transition-all duration-1000 ease-out"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    {progress}%
                </div>
            </div>
            
            <div className="flex-1">
                 <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">Batch {batchId}</h4>
                 <p className="text-xs text-slate-500 mt-1">Keep up the momentum!</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <ChevronRight size={16} />
            </div>
        </div>
    );
};

export default Home;