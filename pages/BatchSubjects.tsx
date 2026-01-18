import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, PlayCircle, Lock, FileText } from 'lucide-react';
import { getBatchById } from '../data';
import { userDb } from '../services/db';
import { User, ClassContent } from '../types';

const BatchSubjects: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [batchContent, setBatchContent] = useState<ClassContent[]>([]);
  
  const batch = getBatchById(batchId);
  
  useEffect(() => {
    const sessionUser = userDb.getSession();
    if (!sessionUser) {
        navigate('/');
        return;
    }
    setUser(sessionUser);

    // Load content specific to this batch
    const loadContent = async () => {
        const allContent = await userDb.getAllContent();
        // Filter content for this batch (In real app, filter by subject too)
        const filtered = allContent.filter(c => c.batchId === batchId);
        setBatchContent(filtered);
    };
    loadContent();
  }, [batchId]);

  if (!batch || !user) return <div className="p-10 text-center">Loading...</div>;

  // Security check: ensure user is enrolled
  if (!user.enrolledBatches?.includes(batchId!)) {
      return (
          <div className="p-10 text-center">
              <Lock className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
              <p className="text-gray-500 mb-4">You have not purchased this course yet.</p>
              <button 
                onClick={() => navigate(`/payment/${batchId}`)}
                className="bg-primary text-white px-6 py-2 rounded-lg"
              >
                  Buy Now
              </button>
          </div>
      );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
       {/* Header */}
       <div className="bg-primary text-white p-6 pb-12 rounded-b-3xl shadow-lg relative">
         <button onClick={() => navigate('/classes')} className="absolute top-4 left-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ArrowLeft size={20} />
         </button>
         <div className="mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
                Enrolled
            </span>
            <h1 className="text-2xl font-bold mt-2">{batch.batchName}</h1>
            <p className="text-blue-100 text-sm mt-1">Start learning your subjects</p>
         </div>
       </div>

       <div className="px-4 -mt-8 relative z-10 space-y-6">
          
          {/* Subjects Grid */}
          <div className="grid grid-cols-2 gap-3">
             {batch.subjects.map((subject, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition cursor-pointer">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        idx % 3 === 0 ? 'bg-orange-100 text-orange-600' :
                        idx % 3 === 1 ? 'bg-purple-100 text-purple-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                        <Book size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">{subject}</h3>
                    <p className="text-xs text-gray-400">View Chapters</p>
                 </div>
             ))}
          </div>

          {/* Recent Content / Videos for this batch */}
          <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <PlayCircle className="text-primary" size={20} /> Recent Classes
              </h2>
              {batchContent.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-dashed text-center text-gray-500">
                      No videos uploaded for this batch yet.
                  </div>
              ) : (
                  <div className="space-y-3">
                      {batchContent.map(content => (
                          <div key={content.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                              <div className="w-24 h-16 bg-black rounded-lg flex-shrink-0 relative overflow-hidden">
                                 <iframe 
                                    src={content.videoUrl} 
                                    className="w-full h-full pointer-events-none" 
                                    title="thumb"
                                 />
                                 <div className="absolute inset-0 bg-black/10"></div>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{content.subject}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(content.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <h4 className="font-bold text-gray-800 text-sm line-clamp-1 mt-1">{content.title}</h4>
                                  <p className="text-xs text-gray-500 line-clamp-1">{content.description}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
       </div>
    </div>
  );
};

export default BatchSubjects;