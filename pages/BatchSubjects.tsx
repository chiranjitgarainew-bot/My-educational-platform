import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Lock, ChevronRight } from 'lucide-react';
import { getBatchById } from '../data';
import { userDb } from '../services/db';
import { User } from '../types';

const BatchSubjects: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  const batch = getBatchById(batchId);
  
  useEffect(() => {
    const sessionUser = userDb.getSession();
    if (!sessionUser) {
        navigate('/');
        return;
    }
    setUser(sessionUser);
  }, [batchId, navigate]);

  if (!batch || !user) return <div className="p-10 text-center">Loading...</div>;

  // Security check
  if (!user.enrolledBatches?.includes(batchId!)) {
      return (
          <div className="p-10 text-center">
              <Lock className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
              <button onClick={() => navigate(`/payment/${batchId}`)} className="mt-4 bg-primary text-white px-6 py-2 rounded-lg">Buy Now</button>
          </div>
      );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
       <div className="bg-primary text-white p-6 pb-12 rounded-b-3xl shadow-lg relative">
         <button onClick={() => navigate('/classes')} className="absolute top-4 left-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ArrowLeft size={20} />
         </button>
         <div className="mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">Batch {batch.name}</span>
            <h1 className="text-2xl font-bold mt-2">{batch.batchName}</h1>
            <p className="text-blue-100 text-sm mt-1">Select a subject to start learning</p>
         </div>
       </div>

       <div className="px-4 -mt-8 relative z-10 space-y-4">
          <div className="grid gap-3">
             {batch.subjects.map((subject, idx) => (
                 <div 
                    key={idx} 
                    onClick={() => navigate(`/batch/${batchId}/subject/${encodeURIComponent(subject)}`)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition cursor-pointer group"
                 >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            idx % 3 === 0 ? 'bg-orange-100 text-orange-600' :
                            idx % 3 === 1 ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            <Book size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{subject}</h3>
                            <p className="text-xs text-gray-500">View Chapters & Lectures</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-primary group-hover:text-white transition">
                        <ChevronRight size={20} />
                    </div>
                 </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default BatchSubjects;