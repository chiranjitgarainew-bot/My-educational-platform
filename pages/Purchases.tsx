import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RoutePath } from '../types';
import { userDb } from '../services/db';
import { BATCHES } from '../data';
import { BookOpen, ArrowRight, Package, ShoppingBag, Zap } from 'lucide-react';

const Purchases: React.FC = () => {
  const navigate = useNavigate();
  const [purchasedBatches, setPurchasedBatches] = useState<typeof BATCHES>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
      const sessionUser = userDb.getSession();
      
      if (sessionUser) {
        const user = await userDb.getUserById(sessionUser.id) || sessionUser;
        if (user.enrolledBatches && user.enrolledBatches.length > 0) {
          const batches = BATCHES.filter(b => user.enrolledBatches?.includes(b.id));
          setPurchasedBatches(batches);
        }
      }
      setLoading(false);
    };

    loadPurchases();
  }, []);

  const handleBatchClick = (batchId: string) => {
    navigate(`/batch/${batchId}/subjects`);
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Loading your courses...</div>;
  }

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm border-b border-slate-200 sticky top-0 z-20 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <ShoppingBag size={20} />
        </div>
        <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">Your Purchases</h1>
      </div>

      <div className="p-4 space-y-6">
        {purchasedBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
            <div className="bg-slate-100 p-8 rounded-full mb-6 relative">
              <Package size={64} className="text-slate-300" />
              <div className="absolute top-0 right-0 p-2 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">No Courses Yet</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
              Unlock your potential by enrolling in one of our premium batches today.
            </p>
            <button 
              onClick={() => navigate(RoutePath.CLASSES)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-glow hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Browse Batches
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {purchasedBatches.map((batch, index) => (
              <div 
                key={batch.id} 
                onClick={() => handleBatchClick(batch.id)}
                className="group relative bg-white rounded-3xl p-1 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer animate-fade-in-up hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
                
                <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col relative z-0">
                    <div className={`h-28 w-full ${batch.color} relative overflow-hidden`}>
                         <div className="absolute inset-0 bg-black/10"></div>
                         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                         <div className="absolute top-5 left-5">
                             <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <Zap size={10} className="text-yellow-300" fill="currentColor" /> Active Batch
                             </span>
                         </div>
                    </div>
                    
                    <div className="p-6 -mt-10">
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-50">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                {batch.batchName}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                                {batch.description}
                            </p>
                            
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <BookOpen size={14} className="text-indigo-500" />
                                    {batch.subjects.length} Subjects
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </div>
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

export default Purchases;