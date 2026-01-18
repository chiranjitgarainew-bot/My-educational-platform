import React, { useEffect, useState } from 'react';
import { User, ClassContent } from '../types';
import { Book, Users, ArrowRight, Check, PlayCircle, Clock, Star, Play, Video } from 'lucide-react';
import { userDb } from '../services/db';
import { BATCHES } from '../data';
import { useNavigate } from 'react-router-dom';

const Classes: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classContents, setClassContents] = useState<ClassContent[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = userDb.getSession();
    setCurrentUser(user);
    loadContent();
  }, []);

  const loadContent = async () => {
    const content = await userDb.getAllContent();
    setClassContents(content);
  };

  const handleCardClick = (batchId: string) => {
    navigate(`/classes/${batchId}`);
  };

  const handleVideoClick = (contentId: string) => {
      navigate(`/player/${contentId}`);
  };

  return (
    <div className="pb-24">
      <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Explore Batches</h2>
          <p className="text-slate-500 text-sm mt-1">Select your class to begin the journey</p>
      </div>
      
      {/* Batch List */}
      <div className="grid gap-6 mb-12">
        {BATCHES.map((batch, index) => {
          const isEnrolled = currentUser?.enrolledBatches?.includes(batch.id);

          return (
            <div 
              key={batch.id} 
              onClick={() => handleCardClick(batch.id)}
              className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-slate-100 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Decorative Header */}
              <div className={`h-24 w-full ${batch.color} opacity-90 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border border-white/20 shadow-sm ${isEnrolled ? 'bg-green-500/90 text-white' : 'bg-white/90 text-slate-700'}`}>
                        {isEnrolled ? <Check size={10} strokeWidth={4} /> : <Star size={10} fill="currentColor" className="text-yellow-400" />}
                        {isEnrolled ? 'Enrolled' : '2024-25 Batch'}
                      </span>
                  </div>
              </div>
              
              <div className="p-6 relative">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-lg absolute -top-7 right-6 flex items-center justify-center text-slate-700 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Book size={24} className="group-hover:text-indigo-600 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{batch.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">{batch.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Users size={16} />
                      <span>{batch.subjects.length} Subjects</span>
                    </div>
                    
                    {isEnrolled ? (
                      <span className="text-green-600 text-sm font-bold flex items-center bg-green-50 px-3 py-1.5 rounded-lg">
                        <Check size={16} className="mr-1" /> Access Now
                      </span>
                    ) : (
                      <button className="text-indigo-600 text-sm font-bold flex items-center group/btn">
                        View Details <ArrowRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uploaded Classes/Videos Section */}
      <div className="pt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <PlayCircle size={20} />
          </div>
          Latest Uploads
        </h2>

        {classContents.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">No classes uploaded recently.</p>
          </div>
        ) : (
          <div className="grid gap-6">
             {classContents.map((content, idx) => {
               const isYouTube = content.videoUrl.includes('youtube') || content.videoUrl.includes('youtu.be');
               
               return (
               <div key={content.id} onClick={() => handleVideoClick(content.id)} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                 <div className="aspect-video w-full bg-slate-900 relative">
                   {isYouTube ? (
                       <iframe 
                         src={content.videoUrl} 
                         title={content.title}
                         className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" // Disable interaction in preview
                       ></iframe>
                   ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-800 relative">
                           {content.thumbnail ? (
                               <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                           ) : (
                               <Video size={48} className="text-slate-600" />
                           )}
                           <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                   <Play size={20} fill="currentColor" />
                               </div>
                           </div>
                       </div>
                   )}
                 </div>
                 <div className="p-5">
                   <div className="flex justify-between items-start mb-3">
                     <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider">
                       {content.subject}
                     </span>
                     <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                       <Clock size={12} /> {new Date(content.timestamp).toLocaleDateString()}
                     </span>
                   </div>
                   <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{content.title}</h3>
                   <p className="text-xs text-slate-500 mb-4 line-clamp-2">{content.description}</p>
                   <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                      For Class {content.batchId}
                   </div>
                 </div>
               </div>
             );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;