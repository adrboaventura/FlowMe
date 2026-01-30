
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatRoom, ChatMessage, Group, Workflow } from '../types';
import { t } from '../services/i18n';

interface ChatHubProps {
  user: User;
  rooms: ChatRoom[];
  messages: ChatMessage[];
  groups: Group[];
  workflows: Workflow[];
  allUsers?: User[];
  onSendMessage: (roomId: string, text: string) => void;
  onOpenPrivateChat?: (targetUser: User) => void;
}

const ChatHub: React.FC<ChatHubProps> = ({ user, rooms, messages, groups, workflows, allUsers = [], onSendMessage, onOpenPrivateChat }) => {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(rooms[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'people'>('rooms');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lang = user.preferredLanguage || 'en';

  // Ensure an active room is set if rooms exist and none is selected
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const roomMessages = messages.filter(m => m.roomId === activeRoomId).sort((a, b) => a.timestamp - b.timestamp);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeRoomId) return;
    onSendMessage(activeRoomId, inputText);
    setInputText('');
  };

  const getRoomIcon = (room: ChatRoom) => {
    if (room.type === 'private') {
      return (
        <img 
          src={room.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.name}`} 
          className="w-10 h-10 rounded-xl object-cover border border-slate-100" 
          alt={room.name}
        />
      );
    }
    switch (room.type) {
      case 'company': return <span className="text-xl">🏢</span>;
      case 'group': return <span className="text-xl">🏘️</span>;
      case 'workflow': return <span className="text-xl">🔄</span>;
      default: return <span className="text-xl">💬</span>;
    }
  };

  const filteredPeople = allUsers.filter(u => 
    u.id !== user.id && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRooms = rooms.filter(r => 
    r.type !== 'private' && 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-700">
      {/* Sidebar - WhatsApp Style */}
      <div className="w-80 flex flex-col gap-6 shrink-0 no-print">
        <div className="bg-white flex flex-col rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden h-full">
          {/* Sidebar Header */}
          <div className="p-6 pb-2 space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setActiveTab('rooms')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'rooms' ? 'bg-white text-candy-petrol shadow-sm' : 'text-slate-400'}`}
              >
                Channels
              </button>
              <button 
                onClick={() => setActiveTab('people')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'people' ? 'bg-white text-candy-petrol shadow-sm' : 'text-slate-400'}`}
              >
                People
              </button>
            </div>
            
            <div className="relative">
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-candy-petrol/20 transition-all"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
            {activeTab === 'rooms' ? (
              filteredRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${
                    activeRoomId === room.id ? 'bg-candy-mint text-candy-petrol shadow-sm' : 'bg-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeRoomId === room.id ? 'bg-white' : 'bg-slate-50'}`}>
                    {getRoomIcon(room)}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`font-black text-xs truncate ${activeRoomId === room.id ? 'text-candy-petrol' : 'text-slate-700'}`}>{room.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{room.type}</p>
                  </div>
                </button>
              ))
            ) : (
              filteredPeople.map(p => (
                <button
                  key={p.id}
                  onClick={() => onOpenPrivateChat?.(p)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left hover:bg-slate-50 group"
                >
                  <img src={p.picture} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" alt={p.name} />
                  <div className="overflow-hidden">
                    <p className="font-black text-xs truncate text-slate-700 group-hover:text-candy-petrol transition-colors">{p.displayName || p.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{p.role}</p>
                  </div>
                </button>
              ))
            )}
            
            {activeTab === 'rooms' && rooms.filter(r => r.type === 'private').map(room => (
               <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${
                    activeRoomId === room.id ? 'bg-candy-mint text-candy-petrol shadow-sm' : 'bg-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="shrink-0">{getRoomIcon(room)}</div>
                  <div className="overflow-hidden">
                    <p className={`font-black text-xs truncate ${activeRoomId === room.id ? 'text-candy-petrol' : 'text-slate-700'}`}>{room.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Direct Message</p>
                  </div>
                </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-50 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-candy-mint/30">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden bg-white ${activeRoom.type !== 'private' ? 'bg-white' : ''}`}>
                  {getRoomIcon(activeRoom)}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 tracking-tight text-lg">{activeRoom.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <p className="text-[10px] text-candy-petrol font-black uppercase tracking-widest">
                      {activeRoom.type === 'private' ? 'Secure Direct Line' : 'Operational Channel'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 no-scrollbar bg-slate-50/20">
              {roomMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <span className="text-6xl mb-4">✨</span>
                  <p className="font-black text-slate-400 italic">This is the start of a legendary dialogue.</p>
                  <p className="text-[10px] uppercase tracking-[0.4em] mt-2">All comms are end-to-end operational</p>
                </div>
              ) : (
                roomMessages.map((msg, i) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        <img src={msg.senderPicture} className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 mt-1" alt="" />
                        <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">
                            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className={`p-5 rounded-[2rem] font-medium text-sm shadow-sm leading-relaxed ${
                            isMe ? 'bg-candy-petrol text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-50'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-50 no-print">
              <div className="max-w-4xl mx-auto bg-slate-50 p-2 rounded-[2.5rem] border border-slate-100 flex gap-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type an operational message..."
                  className="flex-1 bg-transparent border-none outline-none px-6 font-bold text-slate-700 placeholder:text-slate-300"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="bg-candy-petrol text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg shadow-candy-petrol/20 hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100"
                >
                  🚀
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Fallback if somehow no room is selected, though we default to first */
          <div className="h-full flex flex-col items-center justify-center p-20 text-center">
             <div className="w-32 h-32 bg-candy-mint rounded-full flex items-center justify-center text-5xl mb-8 opacity-40">📱</div>
             <h4 className="text-2xl font-black text-slate-400">Select a Secure Room</h4>
             <p className="text-slate-300 font-medium italic mt-2">Your operational dialogues are organized by channel and identity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHub;
