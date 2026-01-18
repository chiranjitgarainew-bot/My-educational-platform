import React, { useEffect, useState } from 'react';
import { User, PrivateMessage } from '../types';
import { userDb } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, Circle } from 'lucide-react';

const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<{friend: User, lastMsg: PrivateMessage | undefined}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setLoading(true);
    const session = userDb.getSession();
    if (!session) {
        navigate('/');
        return;
    }
    
    // Refresh user data to get friends
    const user = await userDb.getUserById(session.id);
    if (!user) return;
    setCurrentUser(user);

    if (user.friends && user.friends.length > 0) {
        const chats = await Promise.all(user.friends.map(async (friendId) => {
            const friend = await userDb.getUserById(friendId);
            const lastMsg = await userDb.getLastMessage(user.id, friendId);
            return { friend, lastMsg };
        }));

        // Filter valid friends and sort by last message timestamp
        const validChats = chats.filter(c => c.friend !== undefined) as {friend: User, lastMsg: PrivateMessage | undefined}[];
        
        validChats.sort((a, b) => {
            const timeA = a.lastMsg?.timestamp || 0;
            const timeB = b.lastMsg?.timestamp || 0;
            return timeB - timeA;
        });

        setConversations(validChats);
    }
    setLoading(false);
  };

  const formatTime = (ts: number) => {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MessageSquare className="text-primary" /> Inbox
      </h1>

      {loading ? (
          <div className="text-center p-10">Loading chats...</div>
      ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed text-center p-6">
              <MessageSquare size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No messages yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start chatting with your friends!</p>
              <button onClick={() => navigate('/community')} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition">
                  Find Friends
              </button>
          </div>
      ) : (
          <div className="space-y-1">
              {conversations.map(({ friend, lastMsg }) => {
                  const isUnread = lastMsg && lastMsg.receiverId === currentUser?.id && !lastMsg.isRead;

                  return (
                    <div 
                        key={friend.id} 
                        onClick={() => navigate(`/chat/${friend.id}`)}
                        className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition border border-transparent hover:bg-white hover:border-gray-100 ${isUnread ? 'bg-blue-50' : 'bg-transparent'}`}
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="relative">
                                <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="min-w-0">
                                <h4 className={`text-base truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                                    {friend.name}
                                </h4>
                                <p className={`text-sm truncate ${isUnread ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                    {lastMsg ? (lastMsg.senderId === currentUser?.id ? `You: ${lastMsg.text}` : lastMsg.text) : 'Start a conversation'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 pl-2">
                             {lastMsg && <span className="text-[10px] text-gray-400">{formatTime(lastMsg.timestamp)}</span>}
                             {isUnread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                             {!isUnread && !lastMsg && <ChevronRight size={16} className="text-gray-300" />}
                        </div>
                    </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default Inbox;