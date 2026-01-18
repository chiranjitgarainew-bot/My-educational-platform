import React, { useEffect, useState } from 'react';
import { User, ClassContent } from '../types';
import { Book, Users, ArrowRight, Check, PlayCircle, Clock } from 'lucide-react';
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

  return (
    <div className="pb-24">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Batch</h2>
      
      {/* Batch List */}
      <div className="grid gap-5 mb-10">
        {BATCHES.map((batch) => {
          const isEnrolled = currentUser?.enrolledBatches?.includes(batch.id);

          return (
            <div 
              key={batch.id} 
              onClick={() => handleCardClick(batch.id)}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex">
                <div className={`${batch.color} w-2`}></div>
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${isEnrolled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isEnrolled ? 'Enrolled' : 'Batch 2024-25'}
                    </span>
                    <Book className="text-gray-300 group-hover:text-primary transition-colors" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{batch.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{batch.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users size={14} className="mr-1" />
                      <span>{batch.subjects.length} Subjects</span>
                    </div>
                    
                    {isEnrolled ? (
                      <button className="text-green-600 text-sm font-semibold flex items-center cursor-default">
                        <Check size={16} className="mr-1" /> Joined
                      </button>
                    ) : (
                      <button 
                        className="text-primary text-sm font-semibold flex items-center hover:underline"
                      >
                        View Details <ArrowRight size={16} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uploaded Classes/Videos Section */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PlayCircle className="text-red-600" /> Latest Classes
        </h2>

        {classContents.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No classes have been uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
             {classContents.map((content) => (
               <div key={content.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="aspect-video w-full bg-black">
                   <iframe 
                     src={content.videoUrl} 
                     title={content.title}
                     className="w-full h-full"
                     allowFullScreen
                   ></iframe>
                 </div>
                 <div className="p-4">
                   <div className="flex justify-between items-start mb-2">
                     <span className="bg-blue-100 text-primary text-xs font-bold px-2 py-1 rounded">
                       {content.subject}
                     </span>
                     <span className="text-xs text-gray-500 flex items-center gap-1">
                       <Clock size={12} /> {new Date(content.timestamp).toLocaleDateString()}
                     </span>
                   </div>
                   <h3 className="font-bold text-lg text-gray-900 mb-1">{content.title}</h3>
                   <p className="text-sm text-gray-600 mb-3">{content.description}</p>
                   <div className="text-xs font-medium text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">
                     For Class {content.batchId}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;