import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Folder, PlayCircle, CheckCircle, Lock, Play, Layers } from 'lucide-react';
import { userDb } from '../services/db';
import { Chapter } from '../types';

const SubjectChapters: React.FC = () => {
  const { batchId, subjectName } = useParams<{ batchId: string; subjectName: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterStats, setChapterStats] = useState<Record<string, { total: number; completed: number }>>({});
  const [loading, setLoading] = useState(true);

  const decodedSubject = decodeURIComponent(subjectName || '');

  useEffect(() => {
    const loadData = async () => {
       if(batchId && subjectName) {
           const userId = userDb.getSession()?.id;
           const chaps = await userDb.getChapters(batchId, decodedSubject);
           setChapters(chaps);

           if (userId) {
               const allContent = await userDb.getAllContent();
               const userProgress = await userDb.getAllUserProgress(userId);
               
               const stats: Record<string, { total: number; completed: number }> = {};
               
               chaps.forEach(ch => {
                   const chapContent = allContent.filter(c => c.chapterId === ch.id);
                   const completedCount = chapContent.filter(c => {
                       const p = userProgress.find(up => up.contentId === c.id);
                       return p?.completed;
                   }).length;
                   
                   stats[ch.id] = { total: chapContent.length, completed: completedCount };
               });
               setChapterStats(stats);
           }
       }
       setLoading(false);
    };
    loadData();
  }, [batchId, subjectName]);

  // Generate colorful gradient for each card index
  const getCardStyle = (index: number) => {
    const styles = [
      { border: 'border-l-pink-500', text: 'text-pink-600', bg: 'hover:bg-pink-50', gradient: 'from-pink-500 to-rose-500' },
      { border: 'border-l-blue-500', text: 'text-blue-600', bg: 'hover:bg-blue-50', gradient: 'from-blue-500 to-cyan-500' },
      { border: 'border-l-purple-500', text: 'text-purple-600', bg: 'hover:bg-purple-50', gradient: 'from-purple-500 to-violet-500' },
      { border: 'border-l-orange-500', text: 'text-orange-600', bg: 'hover:bg-orange-50', gradient: 'from-orange-500 to-amber-500' },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
       {/* Modern Clean Header */}
       <div className="bg-white px-6 pt-8 pb-16 rounded-b-[40px] shadow-sm relative overflow-hidden">
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl"></div>
         
         <div className="relative z-10">
             <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-700 mb-6 inline-flex">
                <ArrowLeft size={20} />
             </button>

            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {chapters.length} Chapters
                </span>
                <span className="px-3 py-1 bg-indigo-50 rounded-lg text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    Batch {batchId}
                </span>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
                {decodedSubject}
            </h1>
         </div>
       </div>

      <div className="px-5 -mt-8 relative z-20 space-y-4">
         {loading ? (
             <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-gray-100 animate-pulse">
                 <div className="text-gray-400 font-medium">Loading content...</div>
             </div>
         ) : (
             chapters.length === 0 ? (
                 <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100 text-gray-400 animate-fade-in-up">
                     <Folder size={64} className="mx-auto mb-4 text-gray-200" />
                     <p className="font-bold text-lg text-gray-600">No chapters found</p>
                     <p className="text-sm">Content is being prepared.</p>
                 </div>
             ) : (
                 chapters.map((chapter, index) => {
                    const stats = chapterStats[chapter.id] || { total: 0, completed: 0 };
                    const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                    const style = getCardStyle(index);
                    
                    return (
                        <div 
                            key={chapter.id}
                            onClick={() => navigate(`/batch/${batchId}/chapter/${chapter.id}`)}
                            className={`group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden border-l-4 ${style.border} animate-fade-in-up`}
                            style={{ animationDelay: `${index * 0.08}s` }}
                        >
                            {/* Background Number Watermark */}
                            <div className={`absolute -right-2 top-1 text-8xl font-black opacity-5 group-hover:opacity-10 transition-opacity ${style.text}`}>
                                {index + 1}
                            </div>

                            <div className="relative z-10 flex items-start gap-4">
                                {/* Stylized Index Box */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                        {chapter.title}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-400 line-clamp-1 mb-4 font-medium">
                                        {chapter.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500">
                                                <PlayCircle size={12} /> {stats.total} Lessons
                                            </div>
                                            {percent === 100 && (
                                                <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                                                    <CheckCircle size={12} /> Done
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Mini Circular Progress or Play Button */}
                                        <div className={`w-8 h-8 rounded-full ${style.bg} ${style.text} flex items-center justify-center transition-colors`}>
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Slim Gradient Progress Bar */}
                                    <div className="mt-3 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${style.gradient}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                 })
             )
         )}
      </div>
    </div>
  );
};

export default SubjectChapters;