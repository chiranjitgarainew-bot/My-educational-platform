import React, { useEffect, useState } from 'react';
import { User, EnrollmentRequest, ClassContent, Coupon, Chapter } from '../types';
import { userDb } from '../services/db';
import { BATCHES } from '../data';
import { 
  Search, User as UserIcon, CheckCircle, XCircle, Clock, 
  Trash2, LayoutGrid, Plus, FolderPlus, Video, Ticket, BarChart2
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'requests' | 'content' | 'coupons' | 'analytics' | 'users'>('requests');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [content, setContent] = useState<ClassContent[]>([]);
  const [analytics, setAnalytics] = useState<{totalWatchHours: number, activeStudents: number, batchStats: Record<string, number>} | null>(null);
  
  // UI State
  const [search, setSearch] = useState('');

  // --- Forms State ---
  const [newCoupon, setNewCoupon] = useState<{ code: string, discountType: 'flat' | 'percent', value: number }>({ 
    code: '', discountType: 'flat', value: 0 
  });
  
  // Content Creation State
  const [selectedBatch, setSelectedBatch] = useState<string>(BATCHES[0].id);
  const [selectedSubject, setSelectedSubject] = useState<string>(BATCHES[0].subjects[0]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  // Video Upload State
  const [selectedChapterForVideo, setSelectedChapterForVideo] = useState('');
  const [videoData, setVideoData] = useState({ title: '', url: '', description: '' });

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    const [allUsers, allRequests, allCoupons, allContent] = await Promise.all([
        userDb.getAllUsers(),
        userDb.getEnrollmentRequests(),
        userDb.getCoupons(),
        userDb.getAllContent()
    ]);
    
    setUsers(allUsers);
    setRequests(allRequests);
    setCoupons(allCoupons);
    setContent(allContent);
    
    if (activeTab === 'analytics') {
        const stats = await userDb.getAdminAnalytics();
        setAnalytics(stats);
    }
    
    setLoading(false);
  };

  // --- Handlers ---
  const handleApprove = async (reqId: string) => { await userDb.approveEnrollment(reqId); loadAllData(); };
  const handleReject = async (reqId: string) => { await userDb.rejectEnrollment(reqId); loadAllData(); };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || newCoupon.value <= 0) return;
    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase(),
      discountType: newCoupon.discountType,
      value: Number(newCoupon.value),
      isActive: true
    };
    await userDb.saveCoupon(coupon);
    setNewCoupon({ code: '', discountType: 'flat', value: 0 });
    loadAllData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if(confirm('Delete coupon?')) { await userDb.deleteCoupon(id); loadAllData(); }
  };

  // Content Handlers
  const fetchChaptersForSelection = async () => {
     const ch = await userDb.getChapters(selectedBatch, selectedSubject);
     setChapters(ch);
  };

  useEffect(() => {
     fetchChaptersForSelection();
  }, [selectedBatch, selectedSubject, activeTab]);

  const handleCreateChapter = async (e: React.FormEvent) => {
     e.preventDefault();
     if(!newChapterTitle) return;
     const chapter: Chapter = {
       id: Date.now().toString(),
       batchId: selectedBatch,
       subject: selectedSubject,
       title: newChapterTitle,
       order: chapters.length + 1
     };
     await userDb.saveChapter(chapter);
     setNewChapterTitle('');
     fetchChaptersForSelection();
     alert('Chapter Created!');
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedChapterForVideo || !videoData.url) return;
    let finalUrl = videoData.url;
    if (finalUrl.includes('watch?v=')) finalUrl = finalUrl.replace('watch?v=', 'embed/');
    else if (finalUrl.includes('youtu.be/')) finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');

    const newContent: ClassContent = {
       id: Date.now().toString(),
       title: videoData.title,
       subject: selectedSubject, 
       batchId: selectedBatch,
       chapterId: selectedChapterForVideo,
       videoUrl: finalUrl,
       description: videoData.description,
       timestamp: Date.now(),
       duration: 600 // Default 10 min
    };
    await userDb.saveClassContent(newContent);
    setVideoData({ title: '', url: '', description: '' });
    loadAllData(); 
    alert('Video Uploaded Successfully!');
  };

  const handleDeleteContent = async (id: string) => {
     if(confirm('Delete this video?')) { await userDb.deleteClassContent(id); loadAllData(); }
  };

  // --- Render Sections ---

  const renderRequests = () => {
    const filteredRequests = requests.filter(r => 
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.status.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 max-w-md shadow-sm">
          <Search className="text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or status..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Batch</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">{req.userName}</div>
                                <div className="text-xs text-gray-500">{req.userEmail}</div>
                            </td>
                            <td className="px-6 py-4">{req.batchName}</td>
                            <td className="px-6 py-4">₹{req.amount}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                {req.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(req.id)} className="text-green-600 hover:bg-green-100 p-2 rounded-full transition-colors"><CheckCircle size={18} /></button>
                                        <button onClick={() => handleReject(req.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors"><XCircle size={18} /></button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No requests found matching your search.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  const renderCoupons = () => (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18}/> Create New Coupon</h3>
          <form onSubmit={handleCreateCoupon} className="flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full">
               <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Code</label>
               <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 outline-none" placeholder="SAVE50" required />
             </div>
             <div className="w-full md:w-40">
               <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Type</label>
               <select 
                 value={newCoupon.discountType} 
                 onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as 'flat' | 'percent'})} 
                 className="w-full border border-gray-300 p-2.5 rounded-lg bg-white outline-none"
               >
                 <option value="flat">Flat ₹</option>
                 <option value="percent">% Off</option>
               </select>
             </div>
             <div className="w-full md:w-32">
               <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Value</label>
               <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none" required />
             </div>
             <button type="submit" className="w-full md:w-auto bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors">Create</button>
          </form>
       </div>
       <div className="grid gap-3">
          {coupons.map(c => (
            <div key={c.id} className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg text-green-600">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800 tracking-wide">{c.code}</div>
                    <div className="text-sm text-green-600 font-bold bg-green-50 inline-block px-2 rounded">
                      {c.discountType === 'flat' ? `₹${c.value} Off` : `${c.value}% Off`}
                    </div>
                  </div>
               </div>
               <button onClick={() => handleDeleteCoupon(c.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"><Trash2 size={18}/></button>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-gray-400 text-center py-8">No active coupons.</p>}
       </div>
    </div>
  );

  const renderContentManager = () => {
    const activeBatch = BATCHES.find(b => b.id === selectedBatch);
    return (
      <div className="space-y-8">
         <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
               <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Select Batch</label>
               <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full p-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none">
                  {BATCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>
            </div>
            <div className="flex-1">
               <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Select Subject</label>
               <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none">
                  {activeBatch?.subjects.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
         </div>
         <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FolderPlus size={18} className="text-blue-600"/> 1. Add Chapter</h3>
                <form onSubmit={handleCreateChapter} className="flex gap-2 mb-4">
                   <input 
                     type="text" 
                     value={newChapterTitle} 
                     onChange={e => setNewChapterTitle(e.target.value)} 
                     placeholder="Chapter Name" 
                     className="flex-1 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     required
                   />
                   <button type="submit" className="bg-gray-900 text-white px-4 rounded-lg text-sm font-bold hover:bg-black transition-colors">Add</button>
                </form>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                   {chapters.map(ch => (
                     <div key={ch.id} className="text-sm bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100">
                        <span className="font-medium text-gray-700">{ch.title}</span>
                     </div>
                   ))}
                   {chapters.length === 0 && <p className="text-xs text-gray-400 italic">No chapters created for this subject yet.</p>}
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Video size={18} className="text-blue-600"/> 2. Upload Video</h3>
                <form onSubmit={handleUploadVideo} className="space-y-4">
                   <select 
                      value={selectedChapterForVideo} 
                      onChange={e => setSelectedChapterForVideo(e.target.value)} 
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                   >
                      <option value="">Select Chapter...</option>
                      {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
                   </select>
                   <input type="text" placeholder="Video Title" value={videoData.title} onChange={e => setVideoData({...videoData, title: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                   <input type="url" placeholder="YouTube URL" value={videoData.url} onChange={e => setVideoData({...videoData, url: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                   <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Publish Video</button>
                </form>
             </div>
         </div>
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">Recent Uploads</div>
            {content.slice(0, 5).map(c => (
              <div key={c.id} className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                 <div>
                    <div className="font-bold text-gray-800 text-sm">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.subject} • {new Date(c.timestamp).toLocaleDateString()}</div>
                 </div>
                 <button onClick={() => handleDeleteContent(c.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
         </div>
      </div>
    );
  };

  const renderAnalytics = () => {
      if (!analytics) return <div className="text-center p-10 text-gray-400">Loading Stats...</div>;

      return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                              <Clock size={24} />
                          </div>
                          <div>
                              <p className="text-sm text-gray-500 font-medium">Total Watch Time</p>
                              <h3 className="text-3xl font-bold text-gray-800">{analytics.totalWatchHours} hrs</h3>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                              <UserIcon size={24} />
                          </div>
                          <div>
                              <p className="text-sm text-gray-500 font-medium">Active Students</p>
                              <h3 className="text-3xl font-bold text-gray-800">{analytics.activeStudents}</h3>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                              <CheckCircle size={24} />
                          </div>
                          <div>
                              <p className="text-sm text-gray-500 font-medium">Completions</p>
                              <h3 className="text-3xl font-bold text-gray-800">
                                  {Object.values(analytics.batchStats).reduce((a: number, b: number) => a + b, 0)}
                              </h3>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart2 size={20} className="text-blue-600"/> Batch Completion Stats
                  </h3>
                  <div className="space-y-4">
                      {Object.keys(analytics.batchStats).length === 0 ? (
                          <p className="text-gray-400 italic">No completion data yet.</p>
                      ) : (
                          Object.entries(analytics.batchStats).map(([batchId, count]) => (
                              <div key={batchId} className="flex items-center gap-4">
                                  <span className="w-24 text-sm font-bold text-gray-700">Batch {batchId}</span>
                                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                      <div 
                                        className="bg-blue-600 h-full rounded-full" 
                                        style={{ width: `${Math.min(100, (count as number) * 5)}%` }} 
                                      ></div>
                                  </div>
                                  <span className="text-sm text-gray-500 font-medium w-32 text-right">{count} completed</span>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const tabs = [
    { id: 'requests' as const, label: 'Enrollments', icon: Clock },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
    { id: 'content' as const, label: 'Content', icon: LayoutGrid },
    { id: 'coupons' as const, label: 'Coupons', icon: Ticket },
    { id: 'users' as const, label: 'Users', icon: UserIcon },
  ];

  return (
    <div className="pb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mb-6 no-scrollbar">
            {tabs.map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] py-4 text-sm font-bold flex flex-col items-center gap-1 border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                  <tab.icon size={20} /> {tab.label}
              </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
           {activeTab === 'requests' && renderRequests()}
           {activeTab === 'analytics' && renderAnalytics()}
           {activeTab === 'coupons' && renderCoupons()}
           {activeTab === 'content' && renderContentManager()}
           {activeTab === 'users' && (
             <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-dashed border-gray-300">
                <UserIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>User management list (Read Only view available in DB)</p>
             </div>
           )}
        </div>
    </div>
  );
}