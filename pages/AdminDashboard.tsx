import React, { useEffect, useState } from 'react';
import { User, EnrollmentRequest, ClassContent, Coupon, Chapter, ClassBatch } from '../types';
import { userDb } from '../services/db';
import { BATCHES } from '../data';
import { 
  Database, Search, User as UserIcon, CheckCircle, XCircle, Clock, 
  Trash2, LayoutGrid, Plus, Tag, FolderPlus, Video, ChevronRight, Ticket
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'content' | 'coupons' | 'users'>('requests');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [content, setContent] = useState<ClassContent[]>([]);
  
  // UI State
  const [search, setSearch] = useState('');

  // --- Forms State ---
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'flat', value: 0 });
  
  // Content Creation State
  const [selectedBatch, setSelectedBatch] = useState<string>(BATCHES[0].id);
  const [selectedSubject, setSelectedSubject] = useState<string>(BATCHES[0].subjects[0]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  // Video Upload State
  const [selectedChapterForVideo, setSelectedChapterForVideo] = useState('');
  const [videoData, setVideoData] = useState({ title: '', url: '', description: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [allUsers, allRequests, allCoupons, allContent] = await Promise.all([
        userDb.getAllUsers(),
        userDb.getEnrollmentRequests(),
        userDb.getCoupons(),
        userDb.getAllContent()
    ]);
    
    // We need to fetch chapters based on context, but here we fetch logically for display if needed
    // For now, let's just re-fetch chapters when batch/subject changes in UI
    
    setUsers(allUsers);
    setRequests(allRequests);
    setCoupons(allCoupons);
    setContent(allContent);
    setLoading(false);
  };

  // --- Handlers ---

  const handleApprove = async (reqId: string) => {
      await userDb.approveEnrollment(reqId);
      loadAllData();
  };

  const handleReject = async (reqId: string) => {
      await userDb.rejectEnrollment(reqId);
      loadAllData();
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || newCoupon.value <= 0) return;
    
    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase(),
      discountType: newCoupon.discountType as any,
      value: Number(newCoupon.value),
      isActive: true
    };
    
    await userDb.saveCoupon(coupon);
    setNewCoupon({ code: '', discountType: 'flat', value: 0 });
    loadAllData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if(confirm('Delete coupon?')) {
      await userDb.deleteCoupon(id);
      loadAllData();
    }
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

    // Convert Youtube URL
    let finalUrl = videoData.url;
    if (finalUrl.includes('watch?v=')) finalUrl = finalUrl.replace('watch?v=', 'embed/');
    else if (finalUrl.includes('youtu.be/')) finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');

    const newContent: ClassContent = {
       id: Date.now().toString(),
       title: videoData.title,
       subject: selectedSubject, // Redundant but kept for search
       batchId: selectedBatch,
       chapterId: selectedChapterForVideo,
       videoUrl: finalUrl,
       description: videoData.description,
       timestamp: Date.now()
    };

    await userDb.saveClassContent(newContent);
    setVideoData({ title: '', url: '', description: '' });
    loadAllData(); // Refresh content list
    alert('Video Uploaded Successfully!');
  };

  const handleDeleteContent = async (id: string) => {
     if(confirm('Delete this video?')) {
         await userDb.deleteClassContent(id);
         loadAllData();
     }
  };

  // --- Render Sections ---

  const renderRequests = () => {
    const filteredRequests = requests.filter(r => 
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.status.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
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
                      <tr key={req.id} className="hover:bg-gray-50">
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
                                      <button onClick={() => handleApprove(req.id)} className="text-green-600 hover:bg-green-100 p-1 rounded"><CheckCircle size={18} /></button>
                                      <button onClick={() => handleReject(req.id)} className="text-red-600 hover:bg-red-100 p-1 rounded"><XCircle size={18} /></button>
                                  </>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    );
  };

  const renderCoupons = () => (
    <div className="space-y-6">
       <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Plus size={16}/> Create Coupon</h3>
          <form onSubmit={handleCreateCoupon} className="flex gap-4 items-end">
             <div className="flex-1">
               <label className="text-xs text-gray-500 block mb-1">Coupon Code</label>
               <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full border p-2 rounded uppercase" placeholder="SAVE50" required />
             </div>
             <div className="w-32">
               <label className="text-xs text-gray-500 block mb-1">Type</label>
               <select value={newCoupon.discountType} onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})} className="w-full border p-2 rounded">
                 <option value="flat">Flat ₹</option>
                 <option value="percent">% Off</option>
               </select>
             </div>
             <div className="w-24">
               <label className="text-xs text-gray-500 block mb-1">Value</label>
               <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})} className="w-full border p-2 rounded" required />
             </div>
             <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">Create</button>
          </form>
       </div>

       <div className="grid gap-3">
          {coupons.map(c => (
            <div key={c.id} className="flex justify-between items-center bg-white p-4 border rounded-lg shadow-sm">
               <div>
                  <div className="font-bold text-lg text-gray-800">{c.code}</div>
                  <div className="text-sm text-green-600 font-medium">
                    {c.discountType === 'flat' ? `₹${c.value} Off` : `${c.value}% Off`}
                  </div>
               </div>
               <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-gray-400 text-center">No coupons active.</p>}
       </div>
    </div>
  );

  const renderContentManager = () => {
    const activeBatch = BATCHES.find(b => b.id === selectedBatch);
    
    return (
      <div className="space-y-8">
         {/* 1. Selection Context */}
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4">
            <div className="flex-1">
               <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Select Batch</label>
               <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full p-2 rounded border border-blue-200">
                  {BATCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>
            </div>
            <div className="flex-1">
               <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Select Subject</label>
               <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-2 rounded border border-blue-200">
                  {activeBatch?.subjects.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
         </div>

         {/* 2. Chapter Management */}
         <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FolderPlus size={18} className="text-primary"/> 1. Add Chapter</h3>
                <form onSubmit={handleCreateChapter} className="flex gap-2 mb-4">
                   <input 
                     type="text" 
                     value={newChapterTitle} 
                     onChange={e => setNewChapterTitle(e.target.value)} 
                     placeholder="Chapter Name (e.g. Thermodynamics)" 
                     className="flex-1 border p-2 rounded text-sm"
                     required
                   />
                   <button type="submit" className="bg-gray-800 text-white px-3 rounded text-sm hover:bg-black">Add</button>
                </form>
                <div className="max-h-40 overflow-y-auto space-y-2">
                   {chapters.map(ch => (
                     <div key={ch.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                        <span>{ch.title}</span>
                        <span className="text-xs text-gray-400">ID: {ch.id.slice(-4)}</span>
                     </div>
                   ))}
                   {chapters.length === 0 && <p className="text-xs text-gray-400">No chapters yet.</p>}
                </div>
             </div>

             <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Video size={18} className="text-primary"/> 2. Upload Video</h3>
                <form onSubmit={handleUploadVideo} className="space-y-3">
                   <select 
                      value={selectedChapterForVideo} 
                      onChange={e => setSelectedChapterForVideo(e.target.value)} 
                      className="w-full border p-2 rounded text-sm bg-white"
                      required
                   >
                      <option value="">Select Chapter...</option>
                      {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
                   </select>
                   <input 
                      type="text" 
                      placeholder="Video Title" 
                      value={videoData.title}
                      onChange={e => setVideoData({...videoData, title: e.target.value})}
                      className="w-full border p-2 rounded text-sm"
                      required
                   />
                   <input 
                      type="url" 
                      placeholder="YouTube URL" 
                      value={videoData.url}
                      onChange={e => setVideoData({...videoData, url: e.target.value})}
                      className="w-full border p-2 rounded text-sm"
                      required
                   />
                   <button type="submit" className="w-full bg-primary text-white py-2 rounded text-sm font-bold hover:bg-blue-600">Publish Video</button>
                </form>
             </div>
         </div>

         {/* 3. Recent Uploads List */}
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">Recent Uploads</div>
            {content.slice(0, 5).map(c => (
              <div key={c.id} className="p-3 border-b flex justify-between items-center hover:bg-gray-50">
                 <div>
                    <div className="font-medium text-sm">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.subject} • {new Date(c.timestamp).toLocaleDateString()}</div>
                 </div>
                 <button onClick={() => handleDeleteContent(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </div>
            ))}
         </div>
      </div>
    );
  };

  return (
    <div className="pb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            {[
              { id: 'requests', label: 'Enrollments', icon: Clock },
              { id: 'content', label: 'Content Manager', icon: LayoutGrid },
              { id: 'coupons', label: 'Coupons', icon: Ticket },
              { id: 'users', label: 'Users', icon: UserIcon },
            ].map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[100px] py-4 text-sm font-bold flex flex-col items-center gap-1 border-b-2 transition ${activeTab === tab.id ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                  <tab.icon size={20} /> {tab.label}
              </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
           {activeTab === 'requests' && renderRequests()}
           {activeTab === 'coupons' && renderCoupons()}
           {activeTab === 'content' && renderContentManager()}
           {activeTab === 'users' && (
             <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-dashed">
                User management list (Read Only view available in DB)
             </div>
           )}
        </div>
    </div>
  );
};

export default AdminDashboard;