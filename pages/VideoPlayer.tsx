import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { userDb } from '../services/db';
import { ClassContent } from '../types';

const VideoPlayer: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ClassContent | null>(null);

  useEffect(() => {
    const loadContent = async () => {
        if(contentId) {
            const data = await userDb.getContentById(contentId);
            if(data) setContent(data);
        }
    };
    loadContent();
  }, [contentId]);

  if (!content) return <div className="p-10 text-center text-white bg-black h-screen">Loading Video...</div>;

  return (
    <div className="bg-black min-h-screen flex flex-col text-white">
       {/* Player Container */}
       <div className="sticky top-0 w-full aspect-video bg-black z-20 shadow-xl">
           <iframe 
             src={`${content.videoUrl}${content.videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0`} 
             title={content.title}
             className="w-full h-full"
             allowFullScreen
             allow="autoplay; encrypted-media"
           ></iframe>
           <button 
             onClick={() => navigate(-1)}
             className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/80 transition"
           >
             <ArrowLeft size={20} color="white" />
           </button>
       </div>

       <div className="p-5 flex-1 bg-gray-900 rounded-t-3xl -mt-4 z-10 relative">
          <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
          
          <h1 className="text-xl font-bold mb-2 leading-tight">{content.title}</h1>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
              <span className="flex items-center gap-1">
                 <Clock size={14} /> {new Date(content.timestamp).toLocaleDateString()}
              </span>
              <button className="flex items-center gap-1 text-primary hover:text-blue-400">
                 <Share2 size={16} /> Share
              </button>
          </div>

          <div className="space-y-4">
             <h3 className="font-bold text-gray-200">Description</h3>
             <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
               {content.description || 'No description available for this lesson.'}
             </p>
          </div>
       </div>
    </div>
  );
};

export default VideoPlayer;