import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Info, Users, ShieldCheck } from 'lucide-react';
import { userDb } from '../services/db';
import { getBatchById } from '../data';
import { User, RoutePath } from '../types';

const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  const batch = getBatchById(batchId);
  
  useEffect(() => {
    setUser(userDb.getSession());
  }, []);

  if (!batch) {
    return <div className="p-8 text-center">Batch not found</div>;
  }

  const isEnrolled = user?.enrolledBatches?.includes(batch.id);

  const handleExploreClick = () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    if (isEnrolled) {
      // If already enrolled, go to subjects
      navigate(`/batch/${batch.id}/subjects`);
    } else {
      // If not enrolled, go to payment
      navigate(`/payment/${batch.id}`);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-gray-800 truncate">Course Details</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        
        {/* Course Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
           <div className="flex justify-between items-start mb-2">
             <h2 className="text-2xl font-bold text-gray-900 leading-tight">{batch.batchName}</h2>
             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Paid
             </span>
           </div>
           
           <div className="text-gray-600 text-sm mb-4 space-y-1">
              <p>
                 <span className="font-semibold text-gray-800">ব্যাচের নাম:</span> {batch.batchName.split('(')[0]} 📌
              </p>
              <div className="mt-2">
                 <span className="font-semibold text-gray-800 block mb-1">কোর্স ইন্সট্রাক্টর:</span>
                 <ul className="list-disc list-inside space-y-1 text-gray-600 pl-1">
                    {batch.instructors.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="flex items-center gap-2 text-gray-500 text-sm border-t border-gray-100 pt-3">
              <BookOpen size={16} /> 
              <span>{batch.subjects.length} Subjects</span>
              <span className="mx-1">•</span>
              <Users size={16} />
              <span>Bengali Medium</span>
           </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            
            {!isEnrolled ? (
                <>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600 font-bold text-sm">Save ₹{batch.originalPrice - batch.price}</span>
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {batch.discount}% OFF
                        </span>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-extrabold text-gray-900">₹{batch.price}</span>
                        <span className="text-lg text-gray-400 line-through mb-1">₹{batch.originalPrice}</span>
                    </div>
                    
                    <button 
                        onClick={handleExploreClick}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Explore Subjects <ArrowLeft className="rotate-180" size={20} />
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <ShieldCheck size={12} /> Secure Payment via UPI / Card
                    </p>
                </>
            ) : (
                <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={24} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">You are Enrolled!</h3>
                    <p className="text-gray-500 text-sm mb-4">You have full access to this batch.</p>
                    <button 
                        onClick={handleExploreClick}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                        Go to Content
                    </button>
                </div>
            )}
        </div>

        {/* Features / Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Info size={18} className="text-primary" /> What's Included
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {batch.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-gray-700 font-medium text-sm">{feature}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default BatchDetails;