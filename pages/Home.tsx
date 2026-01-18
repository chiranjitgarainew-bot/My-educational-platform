import React from 'react';
import { User } from '../types';
import { PlayCircle, Clock, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Hello, {user.name}! 👋</h1>
        <p className="text-blue-100 mb-4">Ready to continue your learning journey?</p>
        <button 
          onClick={() => navigate(RoutePath.CLASSES)}
          className="bg-white text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition"
        >
          Explore Classes
        </button>
      </div>

      {/* Continue Learning Section */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold text-gray-800">Continue Learning</h2>
          <button className="text-sm text-primary font-medium">View All</button>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 flex-shrink-0">
            <PlayCircle size={32} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Mathematics - Algebra</h3>
            <p className="text-xs text-gray-500 mb-2">Class 10 • Batch A</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
            <Clock size={20} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">12h</h3>
          <p className="text-xs text-gray-500">Learning Time</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-3">
            <Award size={20} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">85%</h3>
          <p className="text-xs text-gray-500">Avg. Score</p>
        </div>
      </div>

      {/* Recommended Section */}
      <div>
         <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Recommended For You</h2>
         <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <img src={`https://picsum.photos/seed/${i+10}/100`} alt="Course" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Physics: Motion</h4>
                      <p className="text-xs text-gray-500">Class 9 • 20 Lessons</p>
                    </div>
                 </div>
                 <button className="p-2 text-gray-400 hover:text-primary">
                    <ChevronRight size={20} />
                 </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Home;