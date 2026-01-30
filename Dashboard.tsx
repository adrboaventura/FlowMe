
import React, { useState, useMemo } from 'react';
import { Workflow, WorkflowInstance, User } from '../types';
import { t } from '../services/i18n';

interface DashboardProps {
  workflows: Workflow[];
  history: WorkflowInstance[];
  user: User;
  onCompare?: (instances: WorkflowInstance[]) => void;
  onPrompt: (prompt: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workflows, history, user, onCompare, onPrompt }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [promptText, setPromptText] = useState('');
  const lang = user.preferredLanguage || 'en';

  const calculateScore = (data: any) => {
    const impact = Number(data['score_impact'] || 0) * 0.4;
    const tech = Number(data['score_tech'] || 0) * 0.3;
    const creativity = Number(data['score_creativity'] || 0) * 0.2;
    const features = ((data['gemini_features'] || []).length * 0.2);
    return Number((impact + tech + creativity + Math.min(features, 1.0)).toFixed(2));
  };

  const leaderboard = useMemo(() => {
    return history
      .filter(h => workflows.find(w => w.id === h.workflowId)?.category === 'Hackathon')
      .map(h => ({ ...h, totalScore: calculateScore(h.data) }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  }, [history, workflows]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!promptText.trim()) return;
    onPrompt(promptText);
    setPromptText('');
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pt-4 md:pt-8">
      {/* AI Prompt Ready Bar */}
      <div className="max-w-3xl mx-auto mb-12 animate-in slide-in-from-top-6 duration-700">
        <form 
          onSubmit={handlePromptSubmit}
          className="bg-white p-2 rounded-[2.5rem] shadow-heavy border border-slate-50 flex items-center gap-2 group focus-within:ring-4 focus-within:ring-candy-petrol/10 transition-all"
        >
          <button 
            type="button"
            onClick={() => onPrompt('')}
            className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-2xl hover:bg-candy-mint transition-colors shrink-0"
          >
            🎙️
          </button>
          <input 
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="What do you want to flow today?"
            className="flex-1 bg-transparent px-4 py-4 font-bold text-slate-700 placeholder:text-slate-300 outline-none text-lg"
          />
          <button 
            type="submit"
            className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl hover:bg-black transition-all shadow-lg active:scale-90"
          >
            →
          </button>
        </form>
        <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-6">
          Powered by Gemini 3 operational intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 no-print">
        <StatCard label={t('active_flows', lang)} value={workflows.length} icon="🔄" />
        <StatCard label={t('total_execs', lang)} value={history.length} icon="🎯" />
        <StatCard label={t('score', lang)} value="A+" icon="✨" className="sm:col-span-2 md:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-soft border border-slate-50 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10">
            <div>
              <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">Enterprise Audit Log</p>
            </div>
            {selectedIds.length === 2 && (
              <button onClick={() => onCompare?.(history.filter(h => selectedIds.includes(h.id)))} className="w-full md:w-auto px-6 py-3 bg-candy-petrol text-white rounded-xl font-bold text-xs shadow-lg animate-bounce">Compare with AI ✨</button>
            )}
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-16 md:py-24 border-2 border-dashed border-slate-50 rounded-3xl opacity-30">
                <p className="text-sm font-bold italic text-slate-400">No activity recorded.</p>
              </div>
            ) : (
              history.map(item => {
                const wf = workflows.find(w => w.id === item.workflowId);
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div key={item.id} className={`flex items-center justify-between p-4 md:p-6 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected ? 'bg-candy-mint border-candy-petrol' : 'bg-slate-50/50 border-transparent hover:bg-white'}`}>
                    <div className="flex items-center gap-4 md:gap-5 overflow-hidden">
                      <div onClick={(e) => toggleSelect(item.id, e)} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl shadow-sm transition-all shrink-0 ${isSelected ? 'bg-candy-petrol text-white' : 'bg-white flat-icon'}`}>{isSelected ? '✓' : '📄'}</div>
                      <div className="overflow-hidden">
                         <p className="font-bold text-slate-700 text-sm truncate">{wf?.title || 'Unknown'}</p>
                         <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1 truncate">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 text-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
           <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">🏆 Leaderboard</h3>
           <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">No data yet.</p>
              ) : (
                leaderboard.map((h, i) => (
                  <div key={h.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-4 overflow-hidden">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${i === 0 ? 'bg-candy-petrol text-white' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                        <div className="overflow-hidden">
                           <p className="font-bold text-xs truncate">{h.data['proj_name'] || 'Untitled'}</p>
                        </div>
                     </div>
                     <span className="text-base md:text-lg font-black text-candy-petrol shrink-0 ml-2">{h.totalScore}</span>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, className = "" }: any) => (
  <div className={`bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-soft border border-slate-50 flex flex-col justify-between h-32 md:h-40 group hover:shadow-heavy transition-all ${className}`}>
    <p className="text-slate-500 font-black uppercase text-[8px] tracking-widest">{label}</p>
    <div className="flex items-end justify-between">
      <span className="text-4xl md:text-5xl font-black text-slate-800">{value}</span>
      <span className="text-2xl md:text-3xl flat-icon group-hover:scale-110">{icon}</span>
    </div>
  </div>
);

export default Dashboard;
