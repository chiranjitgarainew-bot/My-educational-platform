import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userDb } from '../services/db';
import { Search, UserPlus, Check, X, MessageCircle, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Community: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'friends'>('discover');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]); // Reload when tab changes

  const loadData = async () => {
    setLoading(true);
    const session = userDb.getSession();
    if (session) {
      // Re-fetch current user to get latest arrays
      const freshUser = await userDb.getUserById(session.id);
      setCurrentUser(freshUser || session);
      
      const users = await userDb.getAllUsers();
      setAllUsers(users);
    }
    setLoading(false);
  };

  // --- ACTIONS ---

  const handleSendRequest = async (targetId: string) => {
    if (!currentUser) return;
    await userDb.sendFriendRequest(currentUser.id, targetId);
    alert('Friend request sent!');
    loadData();
  };

  const handleAcceptRequest = async (requesterId: string) => {
    if (!currentUser) return;
    await userDb.acceptFriendRequest(currentUser.id, requesterId);
    loadData();
  };

  const handleRejectRequest = async (requesterId: string) => {
    if (!currentUser) return;
    await userDb.rejectFriendRequest(currentUser.id, requesterId);
    loadData();
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) return;
    if(confirm('Are you sure you want to remove this friend?')) {
        await userDb.removeFriend(currentUser.id, friendId);
        loadData();
    }
  };

  // --- RENDERERS ---

  const renderDiscover = () => {
    if (!currentUser) return null;
    
    // Filter: Not me, Not already friend, Not requested
    const people = allUsers.filter(u => 
        u.id !== currentUser.id && 
        u.role !== 'admin' &&
        !currentUser.friends?.includes(u.id) && 
        !currentUser.friendRequests?.includes(u.id) &&
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            
            <div className="grid gap-3">
                {people.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <h4 className="font-bold text-gray-800">{u.name}</h4>
                                <p className="text-xs text-gray-500">{u.bio || 'Student'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleSendRequest(u.id)}
                            className="bg-blue-50 text-primary p-2 rounded-full hover:bg-blue-100"
                        >
                            <UserPlus size={20} />
                        </button>
                    </div>
                ))}
                {people.length === 0 && <p className="text-center text-gray-500 mt-10">No new people found.</p>}
            </div>
        </div>
    );
  };

  const renderRequests = () => {
      if (!currentUser || !currentUser.friendRequests?.length) {
          return (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Users size={48} className="mb-2 opacity-20" />
                  <p>No pending requests.</p>
              </div>
          );
      }

      return (
          <div className="space-y-3">
              {currentUser.friendRequests.map(reqId => {
                  const requester = allUsers.find(u => u.id === reqId);
                  if (!requester) return null;

                  return (
                    <div key={reqId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={requester.avatar} alt={requester.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <h4 className="font-bold text-gray-800">{requester.name}</h4>
                                <p className="text-xs text-gray-500">Sent a friend request</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleAcceptRequest(reqId)} className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200">
                                <Check size={18} />
                            </button>
                            <button onClick={() => handleRejectRequest(reqId)} className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                  );
              })}
          </div>
      );
  };

  const renderFriends = () => {
    if (!currentUser || !currentUser.friends?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Users size={48} className="mb-2 opacity-20" />
                <p>You haven't added any friends yet.</p>
                <button onClick={() => setActiveTab('discover')} className="mt-4 text-primary font-bold">Find Friends</button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {currentUser.friends.map(friendId => {
                const friend = allUsers.find(u => u.id === friendId);
                if (!friend) return null;

                return (
                  <div key={friendId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3" onClick={() => navigate(`/chat/${friend.id}`)}>
                          <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover border-2 border-green-100" />
                          <div>
                              <h4 className="font-bold text-gray-800">{friend.name}</h4>
                              <p className="text-xs text-green-600 font-medium">Online</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => navigate(`/chat/${friend.id}`)} className="bg-primary text-white p-2 rounded-full hover:bg-blue-600">
                              <MessageCircle size={18} />
                          </button>
                          <button onClick={() => handleRemoveFriend(friend.id)} className="bg-gray-100 text-gray-400 p-2 rounded-full hover:bg-red-50 hover:text-red-500">
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="pb-24">
       <h1 className="text-2xl font-bold text-gray-800 mb-6">Community</h1>

       {/* Tabs */}
       <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
           <button 
             onClick={() => setActiveTab('discover')} 
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'discover' ? 'bg-blue-50 text-primary' : 'text-gray-500'}`}
           >
             Discover
           </button>
           <button 
             onClick={() => setActiveTab('requests')} 
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'requests' ? 'bg-blue-50 text-primary' : 'text-gray-500'}`}
           >
             Requests {currentUser?.friendRequests?.length ? `(${currentUser.friendRequests.length})` : ''}
           </button>
           <button 
             onClick={() => setActiveTab('friends')} 
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'friends' ? 'bg-blue-50 text-primary' : 'text-gray-500'}`}
           >
             My Friends
           </button>
       </div>

       <div className="animate-fade-in">
           {loading ? <div className="text-center p-10">Loading...</div> : (
               <>
                   {activeTab === 'discover' && renderDiscover()}
                   {activeTab === 'requests' && renderRequests()}
                   {activeTab === 'friends' && renderFriends()}
               </>
           )}
       </div>
    </div>
  );
};

export default Community;