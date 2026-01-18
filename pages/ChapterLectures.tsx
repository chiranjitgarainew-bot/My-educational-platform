import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, CheckCircle, Plus, X, Image as ImageIcon, Video, Trash2, Check, ExternalLink } from 'lucide-react';
import { userDb } from '../services/db';
import { ClassContent, User } from '../types';

const numberToWord = (n: number): string => {
  const map = [
    'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
  ];
  return map[n] || n.toString();
};

const ChapterLectures: React.FC = () => {
  const { batchId, chapterId } = useParams<{ batchId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lectures, setLectures] = useState<ClassContent[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLecture, setNewLecture] = useState({ title: '', videoUrl: '', thumbnail: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [chapterId]);

  const loadData = async () => {
    const user = userDb.getSession();
    if (user) setCurrentUser(user);

    const allContent = await userDb.getAllContent();
    const filtered = allContent
      .filter(c => c.chapterId === chapterId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    setLectures(filtered);

    if (user) {
        const progress = await userDb.getAllUserProgress(user.id);
        const comp = progress.filter(p => p.completed && p.chapterId === chapterId).map(p => p.contentId);
        setCompletedIds(comp);
    }
    setLoading(false);
  };

  // --- Admin Logic ---
  const openAddModal = () => {
    const nextNum = lectures.length + 1;
    setNewLecture({ title: `Lecture ${numberToWord(nextNum)}`, videoUrl: '', thumbnail: '', description: '' });
    setIsModalOpen(true);
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewLecture(prev => ({ ...prev, thumbnail: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.videoUrl) return;
    setIsSubmitting(true);
    let finalUrl = newLecture.videoUrl;
    if (finalUrl.includes('watch?v=')) finalUrl = finalUrl.replace('watch?v=', 'embed/');
    else if (finalUrl.includes('youtu.be/')) finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');

    const content: ClassContent = {
      id: Date.now().toString(),
      title: newLecture.title,
      subject: lectures.length > 0 ? lectures[0].subject : 'General',
      batchId: batchId || '',
      chapterId: chapterId,
      videoUrl: finalUrl,
      thumbnail: newLecture.thumbnail,
      description: newLecture.description || `Lecture content for ${newLecture.title}`,
      timestamp: Date.now(),
      duration: 600,
      order: lectures.length + 1
    };
    await userDb.saveClassContent(content);
    setIsModalOpen(false);
    setIsSubmitting(false);
    loadData();
  };
  
  const handleDeleteLecture = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this lecture?')) {
        await userDb.deleteClassContent(id);
        loadData();
    }
  };

  return (
    <div className="pb-20 bg-[#F8FAFC] min-h-screen relative">
      {/* Bright Header */}
      <div className="bg-white sticky top-0 z-20 px-6 py-4 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-700 transition">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="font-bold text-lg text-gray-900">Lectures</h1>
                <p className="text-xs text-gray-500 font-medium">{lectures.length} Videos Available</p>
            </div>
        </div>
        {completedIds.length > 0 && (
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                 <Check size={14} strokeWidth={3} /> {completedIds.length} Watched
             </div>
        )}
      </div>

      <div className="p-5">
         {loading ? <div className="text-center p-10 text-gray-400">Loading Content...</div> : (
             <>
                {lectures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                        <Video size={48} className="mb-3 text-gray-200" />
                        <p className="font-medium text-gray-500">No lectures uploaded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lectures.map((lecture, idx) => {
                            const isCompleted = completedIds.includes(lecture.id);
                            // Unique colors for each card to make it pop
                            const colors = [
                                'from-blue-400 to-indigo-500',
                                'from-purple-400 to-pink-500',
                                'from-emerald-400 to-teal-500',
                                'from-orange-400 to-red-500'
                            ];
                            const accentGradient = colors[idx % colors.length];

                            return (
                                <div 
                                    key={lecture.id}
                                    onClick={() => navigate(`/player/${lecture.id}`)}
                                    className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col border border-gray-100 hover:border-transparent hover:-translate-y-1 animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    {/* Thumbnail Area */}
                                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                                        {lecture.thumbnail ? (
                                            <img 
                                                src={lecture.thumbnail} 
                                                alt={lecture.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            // Fallback Gradient Pattern if no thumbnail
                                            <div className={`w-full h-full bg-gradient-to-br ${accentGradient} opacity-90 relative`}>
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                                <div className="absolute bottom-4 left-4 text-white font-black text-4xl opacity-20">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                            <div className="relative">
                                                {/* Ripple Effect */}
                                                {!isCompleted && <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>}
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${isCompleted ? 'bg-green-500 text-white' : 'bg-white text-indigo-600'}`}>
                                                    {isCompleted ? <CheckCircle size={24} /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                                            10:00
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-5 flex-1 flex flex-col relative">
                                        {currentUser?.role === 'admin' && (
                                            <button 
                                                onClick={(e) => handleDeleteLecture(e, lecture.id)}
                                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition z-10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${isCompleted ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                Lecture {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-gray-800 text-lg leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                                            {lecture.title}
                                        </h3>
                                        
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                            {lecture.description || 'Core concepts explained in detail.'}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-300" /> 
                                                <span>{new Date(lecture.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Start <ExternalLink size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
             </>
         )}
      </div>

      {/* ADMIN ADD BUTTON */}
      {currentUser?.role === 'admin' && (
          <button 
            onClick={openAddModal}
            className="fixed bottom-24 right-6 bg-gray-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-black hover:scale-110 transition z-40"
          >
              <Plus size={28} />
          </button>
      )}

      {/* ADMIN ADD MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <Plus size={18} className="text-indigo-500" /> New Lecture
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSaveLecture} className="p-6 space-y-5">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                          <input 
                            type="text" 
                            value={newLecture.title} 
                            onChange={e => setNewLecture({...newLecture, title: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Video URL <span className="text-red-500">*</span></label>
                          <div className="relative">
                             <Video className="absolute left-3 top-3.5 text-gray-400" size={18} />
                             <input 
                                type="url" 
                                required
                                placeholder="YouTube URL..."
                                value={newLecture.videoUrl} 
                                onChange={e => setNewLecture({...newLecture, videoUrl: e.target.value})}
                                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                             />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail</label>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                          >
                              {newLecture.thumbnail ? (
                                  <img src={newLecture.thumbnail} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                              ) : (
                                  <>
                                      <ImageIcon className="text-gray-300 mb-2" size={32} />
                                      <span className="text-sm text-gray-400">Click to upload image</span>
                                  </>
                              )}
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                          </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition"
                      >
                          {isSubmitting ? 'Saving...' : 'Add Lecture'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ChapterLectures;