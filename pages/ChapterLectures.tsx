import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Lock } from 'lucide-react';
import { userDb } from '../services/db';
import { ClassContent } from '../types';

const ChapterLectures: React.FC = () => {
  const { batchId, chapterId } = useParams<{ batchId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<ClassContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLectures = async () => {
       const allContent = await userDb.getAllContent();
       const filtered = allContent.filter(c => c.chapterId === chapterId).sort((a,b) => b.timestamp - a.timestamp);
       setLectures(filtered);
       setLoading(false);
    };
    loadLectures();
  }, [chapterId]);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-gray-800">Lectures</h1>
      </div>

      <div className="p-4 space-y-4">
         {loading ? <div className="text-center">Loading...</div> : (
             lectures.length === 0 ? (
                 <div className="text-center p-10 text-gray-400">No lectures in this chapter.</div>
             ) : (
                 lectures.map((lecture) => (
                    <div 
                        key={lecture.id}
                        onClick={() => navigate(`/player/${lecture.id}`)}
                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex gap-3"
                    >
                        <div className="w-28 h-20 bg-gray-900 rounded-lg relative overflow-hidden flex-shrink-0 group">
                            <iframe src={lecture.videoUrl} className="w-full h-full opacity-50 pointer-events-none" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 p-1.5 rounded-full text-primary">
                                    <Play size={16} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug">{lecture.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{lecture.description}</p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1"><Clock size={10} /> {new Date(lecture.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                 ))
             )
         )}
      </div>
    </div>
  );
};

export default ChapterLectures;