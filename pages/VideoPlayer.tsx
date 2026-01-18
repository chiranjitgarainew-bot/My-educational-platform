import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, CheckCircle, Save, Lock, AlertCircle } from 'lucide-react';
import { userDb } from '../services/db';
import { ClassContent, ProgressRecord } from '../types';
import Hls from 'hls.js';

const VideoPlayer: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  
  // Content State
  const [content, setContent] = useState<ClassContent | null>(null);
  
  // Progress State
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const watchedSecondsRef = useRef(0);
  const userRef = useRef<string | null>(null);
  const durationRef = useRef(600); // Default 10 mins
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // 1. Initialize Data & Player
    const initPage = async () => {
        if (!contentId) return;
        
        const currentUser = userDb.getSession();
        if (!currentUser) {
            navigate('/');
            return;
        }
        userRef.current = currentUser.id;

        const data = await userDb.getContentById(contentId);
        
        if (data) {
            setContent(data);
            durationRef.current = data.duration || 600;
            
            // Fetch Resume Point
            const progress = await userDb.getProgress(currentUser.id, contentId);
            let startSeconds = 0;

            if (progress) {
                startSeconds = progress.watchedSeconds;
                setWatchedSeconds(startSeconds);
                watchedSecondsRef.current = startSeconds;
                setIsCompleted(progress.completed);
            }

            // --- Player Logic based on URL Type ---
            const url = data.videoUrl;
            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
            
            if (!isYouTube && videoRef.current) {
                // Handle HLS (m3u8)
                if (url.includes('.m3u8')) {
                    if (Hls.isSupported()) {
                        if (hlsRef.current) hlsRef.current.destroy();
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(videoRef.current);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            if (videoRef.current) {
                                videoRef.current.currentTime = startSeconds;
                                videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                            }
                        });
                        hls.on(Hls.Events.ERROR, (event, data) => {
                            if (data.fatal) {
                                setError("Stream loading failed. Please try again.");
                            }
                        });
                        hlsRef.current = hls;
                    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native HLS support (Safari)
                        videoRef.current.src = url;
                        videoRef.current.currentTime = startSeconds;
                        videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                    } else {
                        setError("Your browser does not support HLS playback.");
                    }
                } 
                // Handle MP4 / Direct Files
                else {
                     videoRef.current.src = url;
                     videoRef.current.currentTime = startSeconds;
                     videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                }
            }
        }
    };
    initPage();

    return () => {
        if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [contentId, navigate]);

  // 2. Timer: Increments watch time locally every second
  useEffect(() => {
    if (!content) return;
    
    const tickInterval = setInterval(() => {
        // For native video, sync with actual player time
        if (videoRef.current && !videoRef.current.paused) {
            const current = Math.floor(videoRef.current.currentTime);
            setWatchedSeconds(current);
            watchedSecondsRef.current = current;
        } 
        // For YouTube (iframe), we approximate or use API (using approximation here for simplicity as we used plain iframe)
        else if (content.videoUrl.includes('youtube')) {
             setWatchedSeconds(prev => {
                const next = prev + 1;
                watchedSecondsRef.current = next;
                return next;
             });
        }
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [content]);

  // 3. Auto-Saver: Saves to DB every 10 seconds
  useEffect(() => {
    if (!content) return;

    const saveInterval = setInterval(async () => {
        await saveProgressToDb();
    }, 10000); // 10 seconds

    return () => {
        clearInterval(saveInterval);
        saveProgressToDb(); // Save on unmount
    };
  }, [content]);

  const saveProgressToDb = async () => {
      if (!content || !userRef.current) return;
      
      setIsSaving(true);
      const currentSec = watchedSecondsRef.current;
      const totalDuration = durationRef.current;
      const isFinished = (currentSec / totalDuration) >= 0.9;

      const record: ProgressRecord = {
          userId: userRef.current,
          contentId: content.id,
          batchId: content.batchId,
          subject: content.subject,
          chapterId: content.chapterId,
          watchedSeconds: currentSec,
          totalSeconds: totalDuration,
          completed: isFinished,
          lastUpdated: Date.now()
      };

      await userDb.saveProgress(record);
      if (isFinished) setIsCompleted(true);
      setTimeout(() => setIsSaving(false), 800);
  };

  if (!content) return <div className="p-10 text-center text-white bg-black h-screen flex items-center justify-center gap-2"><Lock size={20} /> Authenticating Access...</div>;

  const progressPercent = Math.min(100, Math.round((watchedSeconds / durationRef.current) * 100));
  const isYouTube = content.videoUrl.includes('youtube.com') || content.videoUrl.includes('youtu.be');

  // Construct YouTube URL with start time
  const getYoutubeUrl = () => {
      let finalUrl = content.videoUrl;
      // Ensure embed format
      if (finalUrl.includes('watch?v=')) finalUrl = finalUrl.replace('watch?v=', 'embed/');
      else if (finalUrl.includes('youtu.be/')) finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
      
      const separator = finalUrl.includes('?') ? '&' : '?';
      return `${finalUrl}${separator}autoplay=1&rel=0&modestbranding=1&start=${watchedSecondsRef.current}`;
  };

  return (
    <div className="bg-black min-h-screen flex flex-col text-white select-none">
       {/* Player Area */}
       <div className="sticky top-0 w-full aspect-video bg-black z-20 shadow-xl relative group">
           {error ? (
               <div className="flex flex-col items-center justify-center h-full text-red-500 bg-gray-900">
                   <AlertCircle size={48} className="mb-2" />
                   <p>{error}</p>
               </div>
           ) : isYouTube ? (
               <iframe 
                 src={getYoutubeUrl()} 
                 title={content.title}
                 className="w-full h-full pointer-events-auto"
                 allowFullScreen
                 allow="autoplay; encrypted-media; picture-in-picture"
               ></iframe>
           ) : (
               <video 
                 ref={videoRef}
                 controls
                 className="w-full h-full object-contain"
                 controlsList="nodownload"
                 playsInline
               >
                   <p>Your browser doesn't support HTML5 video.</p>
               </video>
           )}

           <button 
             onClick={() => navigate(-1)}
             className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/80 transition backdrop-blur-sm z-30"
           >
             <ArrowLeft size={20} color="white" />
           </button>
           
           {/* Auto-Save Indicator */}
           <div className={`absolute top-4 right-4 px-2 py-1 bg-black/60 rounded text-xs font-medium flex items-center gap-1 transition-opacity duration-500 z-30 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
              <Save size={12} className="animate-pulse" /> Saving...
           </div>
       </div>

       {/* Details Area */}
       <div className="p-5 flex-1 bg-gray-900 rounded-t-3xl -mt-4 z-10 relative">
          
          {/* Progress Bar & Stats */}
          <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span className="font-mono">{new Date(watchedSeconds * 1000).toISOString().substr(14, 5)}</span>
                  <span className="font-mono">{new Date(durationRef.current * 1000).toISOString().substr(14, 5)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-linear ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
              </div>
              
              {isCompleted && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30 animate-pulse">
                      <CheckCircle size={12} /> Completed
                  </div>
              )}
          </div>
          
          <h1 className="text-xl font-bold mb-2 leading-tight text-white">{content.title}</h1>
          {content.order && <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">Lecture {content.order}</p>}
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
              <span className="flex items-center gap-1.5">
                 <Clock size={14} /> {new Date(content.timestamp).toLocaleDateString()}
              </span>
              <button className="flex items-center gap-1.5 text-primary hover:text-blue-400 transition cursor-not-allowed opacity-50">
                 <Share2 size={16} /> Share Lesson
              </button>
          </div>

          <div className="space-y-4">
             <h3 className="font-bold text-gray-200 text-sm uppercase tracking-wide">About this lesson</h3>
             <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
               {content.description || 'No description available for this lesson.'}
             </p>
          </div>
       </div>
    </div>
  );
};

export default VideoPlayer;