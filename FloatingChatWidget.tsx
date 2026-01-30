
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, ChatRoom, ChatMessage } from '../types';
import { t } from '../services/i18n';

interface FloatingChatWidgetProps {
  user: User;
  rooms: ChatRoom[];
  messages: ChatMessage[];
  forceOpenRoomId?: string | null;
  onSendMessage: (roomId: string, text: string) => void;
  onClose?: () => void;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ 
  user, 
  rooms, 
  messages, 
  forceOpenRoomId, 
  onSendMessage,
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lang = user.preferredLanguage || 'en';

  // Handle external room triggers
  useEffect(() => {
    if (forceOpenRoomId) {
      setIsOpen(true);
      setActiveRoomId(forceOpenRoomId);
    }
  }, [forceOpenRoomId]);

  // Set default room if none selected
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  // Calculate unread counts per room
  const unreadCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    rooms.forEach(room => {
      const lastRead = lastReadTimestamps[room.id] || 0;
      const roomMsgs = messages.filter(m => m.roomId === room.id);
      counts[room.id] = roomMsgs.filter(m => m.timestamp > lastRead && m.senderId !== user.id).length;
    });
    return counts;
  }, [rooms, messages, lastReadTimestamps, user.id]);

  const totalUnread = Object.values(unreadCounts).reduce((a: number, b: number) => a + b, 0);

  // Mark as read when room is open
  useEffect(() => {
    if (isOpen && activeRoomId) {
      setLastReadTimestamps(prev => ({ ...prev, [activeRoomId]: Date.now() }));
    }
  }, [isOpen, activeRoomId, messages.length]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const roomMessages = messages.filter(m => m.roomId === activeRoomId).sort((a, b) => a.timestamp - b.timestamp);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [roomMessages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim() || !activeRoomId) return;
    onSendMessage(activeRoomId, inputText);
    setInputText('');
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'group': return '🏘️';
      case 'workflow': return '🔄';
      default: return '💬';
    }
  };

  const togglePanel = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (!next && onClose) onClose();
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-8 md:bottom-10 md:right-10 z-[60] no-print">
        <button
          onClick={togglePanel}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-500 hover:scale-110 active:scale-95 border-4 border-white relative ${
            isOpen ? 'bg-candy-pink rotate-90' : 'bg-candy-petrol text-white'
          }`}
        >
          {isOpen ? '✕' : '💬'}
          {totalUnread > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Slide-over Chat Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[55] transition-transform duration-500 ease-in-out transform flex flex-col border-l border-slate-100 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="p-8 bg-candy-mint/50 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">FlowMe Chat</h3>
              <p className="text-[10px] text-candy-petrol font-black uppercase tracking-widest">Enterprise Comms</p>
            </div>
            <button 
              onClick={togglePanel}
              className="text-slate-300 hover:text-slate-800 transition-colors p-2"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>

          {/* Room Selector Dropdown */}
          <div className="relative">
            <select
              value={activeRoomId || ''}
              onChange={(e) => setActiveRoomId(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:border-candy-petrol appearance-none cursor-pointer pr-12 shadow-sm"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {getRoomIcon(room.type)} {room.name} {(unreadCounts[room.id] as number) > 0 ? `(${unreadCounts[room.id]})` : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">▼</div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/30">
          {roomMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <span className="text-5xl mb-4">🧊</span>
              <p className="font-black text-slate-400 text-xs italic">Operational quiet.</p>
              <p className="text-[8px] uppercase tracking-widest mt-1">Say something to the team</p>
            </div>
          ) : (
            roomMessages.map((msg, i) => {
              if (msg.type === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-4 animate-in fade-in duration-500">
                    <div className="bg-slate-200/50 px-6 py-2 rounded-full border border-slate-300/30 flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                         <span className="w-1 h-1 bg-candy-petrol rounded-full"></span>
                         {msg.text}
                       </span>
                    </div>
                  </div>
                );
              }

              const isMe = msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img src={msg.senderPicture} className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 mt-1" />
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest px-1 mb-1">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className={`p-4 rounded-[1.5rem] font-bold text-xs shadow-sm ${
                        isMe ? 'bg-candy-petrol text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'
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

        {/* Message Input */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="bg-slate-50 p-2 rounded-3xl flex gap-2 items-center focus-within:ring-2 focus-within:ring-candy-petrol/20 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Send message..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-xs font-bold text-slate-700 placeholder:opacity-30"
            />
            <button
              onClick={handleSend}
              className="bg-candy-petrol text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-candy-petrol/20 hover:scale-105 transition-all"
            >
              🚀
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[54] md:hidden"
          onClick={togglePanel}
        />
      )}
    </>
  );
};

export default FloatingChatWidget;
