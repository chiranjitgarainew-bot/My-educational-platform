import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Folder, PlayCircle } from 'lucide-react';
import { userDb } from '../services/db';
import { Chapter } from '../types';

const SubjectChapters: React.FC = () => {
  const { batchId, subjectName } = useParams<{ batchId: string; subjectName: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
       if(batchId && subjectName) {
           const data = await userDb.getChapters(batchId, decodeURIComponent(subjectName));
           setChapters(data);
       }
       setLoading(false);
    };
    loadChapters();
  }, [batchId, subjectName]);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
       <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-gray-800 truncate">{decodeURIComponent(subjectName || '')}</h1>
      </div>

      <div className="p-4 space-y-4">
         {loading ? <div className="text-center p-8">Loading Chapters...</div> : (
             chapters.length === 0 ? (
                 <div className="text-center p-10 bg-white rounded-xl border border-dashed text-gray-500">
                     <Folder size={48} className="mx-auto mb-2 opacity-20" />
                     <p>No chapters added yet.</p>
                 </div>
             ) : (
                 chapters.map((chapter, index) => (
                    <div 
                        key={chapter.id}
                        onClick={() => navigate(`/batch/${batchId}/chapter/${chapter.id}`)}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{chapter.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <PlayCircle size={12} /> View Lectures
                            </p>
                        </div>
                    </div>
                 ))
             )
         )}
      </div>
    </div>
  );
};

export default SubjectChapters;