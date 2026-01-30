
import React, { useState, useRef } from 'react';
import { User, HelpTopic, AIHelpResponse } from '../types';
import { geminiService } from '../services/geminiService';

interface HelpCenterProps {
  user: User;
  systemState: any;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ user, systemState }) => {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIHelpResponse | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  const docKB = `FlowMe Enterprise Documentation: Field forms, validation rules, and sync hubs.`;

  const handleAskAI = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const response = await geminiService.getAISupportAssistant(question, docKB, systemState, 'English');
      setAiResponse(response);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-40 pt-8">
      <div className="bg-slate-900 text-white p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 space-y-10">
          <h3 className="text-4xl font-black tracking-tight">Ask FlowMe AI</h3>
          <div className="relative">
             <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI()} placeholder="What can I help with?" className="w-full bg-white/10 border-4 border-white/5 px-10 py-8 rounded-[2.5rem] font-bold text-2xl outline-none" />
             <button onClick={handleAskAI} disabled={isAsking || !question} className="absolute right-4 top-1/2 -translate-y-1/2 bg-candy-aqua text-candy-petrol px-10 py-5 rounded-[1.8rem] font-black">{isAsking ? '...' : 'Ask'}</button>
          </div>
          {aiResponse && <div className="bg-white/10 p-12 rounded-[3.5rem]"><p className="text-2xl font-medium italic text-candy-aqua/90">"{aiResponse.answer_text}"</p></div>}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
