import React, { useEffect, useState } from 'react';
import { User, EnrollmentRequest, ClassContent } from '../types';
import { userDb } from '../services/db';
import { 
  Database, Search, Shield, User as UserIcon, BookOpen, 
  CheckCircle, XCircle, Clock, Trash2, LayoutGrid, PlayCircle 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'content'>('requests');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [content, setContent] = useState<ClassContent[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [allUsers, allRequests, allContent] = await Promise.all([
        userDb.getAllUsers(),
        userDb.getEnrollmentRequests(),
        userDb.getAllContent()
    ]);
    setUsers(allUsers);
    setRequests(allRequests);
    setContent(allContent);
    setLoading(false);
  };

  const handleApprove = async (reqId: string) => {
      await userDb.approveEnrollment(reqId);
      loadAllData(); // Refresh
  };

  const handleReject = async (reqId: string) => {
      await userDb.rejectEnrollment(reqId);
      loadAllData(); // Refresh
  };

  const handleDeleteContent = async (id: string) => {
      if(window.confirm('Are you sure you want to delete this video?')) {
          await userDb.deleteClassContent(id);
          loadAllData();
      }
  };

  // --- Render Functions ---

  const renderRequests = () => {
      // Filter requests based on search
      const filteredRequests = requests.filter(r => 
        r.userName.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase())
      );

      return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Batch</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Time</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredRequests.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No requests found.</td></tr>
                    )}
                    {filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">{req.userName}</div>
                                <div className="text-xs text-gray-500">{req.userEmail}</div>
                            </td>
                            <td className="px-6 py-4">{req.batchName}</td>
                            <td className="px-6 py-4 font-mono">₹{req.amount}</td>
                            <td className="px-6 py-4 text-xs">{new Date(req.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {req.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleApprove(req.id)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Approve">
                                            <CheckCircle size={18} />
                                        </button>
                                        <button onClick={() => handleReject(req.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      );
  };

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Batches</th>
                        <th className="px-6 py-3 text-right">User ID</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                                    <div>
                                        <div className="font-bold text-gray-900">{u.name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {u.role.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {u.enrolledBatches?.map(b => (
                                        <span key={b} className="bg-green-50 text-green-700 border border-green-200 px-1.5 rounded text-[10px]">{b}</span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">{u.id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };

  const renderContent = () => {
      const filteredContent = content.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {filteredContent.map(c => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3 shadow-sm">
                     <div className="w-24 h-16 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                         <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                             <PlayCircle size={24} />
                         </div>
                     </div>
                     <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-gray-800 truncate">{c.title}</h4>
                         <p className="text-xs text-gray-500">{c.subject} • Batch {c.batchId}</p>
                         <p className="text-xs text-gray-400 mt-1">{new Date(c.timestamp).toLocaleDateString()}</p>
                     </div>
                     <button 
                        onClick={() => handleDeleteContent(c.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                        title="Delete Content"
                     >
                         <Trash2 size={18} />
                     </button>
                </div>
            ))}
             {filteredContent.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">No content found.</div>
             )}
        </div>
      );
  };

  return (
    <div className="pb-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Control Panel</h1>
        
        {/* Search & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500 text-white p-4 rounded-xl shadow-md">
                <div className="text-blue-100 text-sm font-medium mb-1">Total Users</div>
                <div className="text-3xl font-bold">{users.length}</div>
            </div>
            <div className="bg-orange-500 text-white p-4 rounded-xl shadow-md">
                <div className="text-orange-100 text-sm font-medium mb-1">Pending Requests</div>
                <div className="text-3xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Clock size={18} /> Requests
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <UserIcon size={18} /> Users
                </button>
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'content' ? 'bg-blue-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <LayoutGrid size={18} /> Content
                </button>
            </div>

            <div className="bg-gray-50 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'requests' && renderRequests()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'content' && renderContent()}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;