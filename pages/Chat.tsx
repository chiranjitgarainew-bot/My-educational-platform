import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, PrivateMessage } from '../types';
import { userDb } from '../services/db';
import { ArrowLeft, Send, MoreVertical, Ban, Trash2, Check, CheckCheck } from 'lucide-react';

const Chat: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friend, setFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    initChat();
    return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [friendId]);

  // Scroll to bottom when messages change
  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initChat = async () => {
      const session = userDb.getSession();
      if (!session || !friendId) {
          navigate('/');
          return;
      }
      
      const user = await userDb.getUserById(session.id);
      const friendData = await userDb.getUserById(friendId);

      if (!user || !friendData) return;

      // Privacy Check: Are they friends?
      if (!user.friends?.includes(friendId)) {
          alert("You can only chat with friends.");
          navigate('/community');
          return;
      }

      // Block Check
      if (friendData.blockedUsers?.includes(user.id)) {
          alert("You cannot message this user.");
          navigate('/inbox');
          return;
      }

      setCurrentUser(user);
      setFriend(friendData);
      
      // Check if I blocked them
      if (user.blockedUsers?.includes(friendId)) {
          setIsBlocked(true);
      }

      // Mark messages as read
      await userDb.markAsRead(user.id, friendId);

      // Load initial messages
      fetchMessages(user.id, friendId);

      // Start Polling (Simulating Real-time)
      pollingRef.current = window.setInterval(() => {
          fetchMessages(user.id, friendId);
      }, 2000);
  };

  const fetchMessages = async (userId: string, otherId: string) => {
      const msgs = await userDb.getMessages(userId, otherId);
      setMessages(msgs);
  };

  const handleSend = async () => {
      if (!inputText.trim() || !currentUser || !friendId) return;

      const newMessage: PrivateMessage = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          receiverId: friendId,
          text: inputText.trim(),
          timestamp: Date.now(),
          isRead: false
      };

      await userDb.sendMessage(newMessage);
      setInputText('');
      // Immediate update for UI responsiveness
      setMessages(prev => [...prev, newMessage]);
  };

  const handleBlockUser = async () => {
      if (!currentUser || !friendId) return;
      if (confirm(`Are you sure you want to block ${friend?.name}? This will remove them from friends.`)) {
          await userDb.blockUser(currentUser.id, friendId);
          setIsBlocked(true);
          setShowMenu(false);
          alert('User blocked.');
          navigate('/inbox');
      }
  };

  if (!currentUser || !friend) return <div className="p-10 text-center">Loading Chat...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 fixed inset-0 z-50">
       {/* Chat Header */}
       <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-200 flex items-center justify-between z-10">
           <div className="flex items-center gap-3">
               <button onClick={() => navigate('/inbox')} className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
                   <ArrowLeft size={20} />
               </button>
               <div className="flex items-center gap-3">
                   <div className="relative">
                       <img src={friend.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                       <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   <div>
                       <h3 className="font-bold text-gray-800 leading-tight">{friend.name}</h3>
                       <p className="text-xs text-green-600">Online</p>
                   </div>
               </div>
           </div>
           
           <div className="relative">
               <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                   <MoreVertical size={20} />
               </button>
               {showMenu && (
                   <div className="absolute right-0 top-12 bg-white shadow-xl border border-gray-100 rounded-lg w-40 overflow-hidden">
                       <button onClick={handleBlockUser} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                           <Ban size={16} /> Block User
                       </button>
                   </div>
               )}
           </div>
       </div>

       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] bg-opacity-30">
           {messages.length === 0 && (
               <div className="text-center text-gray-400 text-sm mt-10">
                   <p className="bg-white inline-block px-4 py-1 rounded-full shadow-sm">
                       This is the start of your private conversation with {friend.name}.
                   </p>
               </div>
           )}

           {messages.map((msg, index) => {
               const isMe = msg.senderId === currentUser.id;
               return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div 
                           className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow-sm relative ${
                               isMe 
                                 ? 'bg-primary text-white rounded-tr-none' 
                                 : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                           }`}
                       >
                           {msg.text}
                           <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               {isMe && (
                                   msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                               )}
                           </div>
                       </div>
                   </div>
               );
           })}
           <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="bg-white p-3 border-t border-gray-200">
           {isBlocked ? (
               <div className="text-center text-red-500 text-sm py-2">
                   You have blocked this user. Unblock to send messages.
               </div>
           ) : (
               <div className="flex gap-2 items-center max-w-3xl mx-auto">
                   <input 
                       type="text" 
                       value={inputText}
                       onChange={e => setInputText(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleSend()}
                       placeholder="Type a message..."
                       className="flex-1 bg-gray-100 border-0 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                   />
                   <button 
                       onClick={handleSend}
                       disabled={!inputText.trim()}
                       className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:shadow-none transition transform active:scale-95"
                   >
                       <Send size={20} className="ml-0.5" />
                   </button>
               </div>
           )}
       </div>
    </div>
  );
};

export default Chat;