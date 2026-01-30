
import React, { useState } from 'react';
import { Workflow, WorkflowAlertRule, TriggerType } from '../types';
import { geminiService } from '../services/geminiService';
import { t } from '../services/i18n';

interface AIAlertsProps {
  user: any;
  workflows: Workflow[];
  rules: WorkflowAlertRule[];
  onAddRule: (rule: Omit<WorkflowAlertRule, 'id' | 'createdAt' | 'ownerUserId'>) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
}

const AIAlerts: React.FC<AIAlertsProps> = ({ user, workflows, rules, onAddRule, onDeleteRule, onToggleRule }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  const handleParse = async () => {
    if (!prompt.trim()) return;
    setIsParsing(true);
    try {
      const structured = await geminiService.parseAlertRule(prompt);
      setParsedPreview(structured);
    } catch (err) {
      alert("Failed to interpret rule. Try being more specific!");
    } finally {
      setIsParsing(false);
    }
  };

  const confirmRule = () => {
    if (!parsedPreview) return;
    onAddRule({
      workflowId: selectedWorkflowId,
      ruleText: prompt,
      structuredRule: parsedPreview,
      isActive: true
    });
    setPrompt('');
    setParsedPreview(null);
  };

  const lang = user?.preferredLanguage || 'en';

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter">AI Supervisor</h2>
          <p className="text-candy-petrol font-black uppercase text-[10px] tracking-[0.4em] mt-3">Autonomous Oversight Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Rule Creator */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">New Mission Directive</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Target Workflow</label>
                <select 
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-none outline-none font-bold text-slate-600 focus:ring-4 focus:ring-candy-petrol/5"
                >
                  {workflows.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Natural Language Instruction</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Alert me if this isn't done by 6pm today..."
                  className="w-full px-8 py-6 bg-candy-mint rounded-3xl border-none outline-none focus:ring-4 focus:ring-candy-petrol/10 min-h-[120px] font-black text-xl placeholder:opacity-20 shadow-inner"
                />
              </div>

              <button 
                onClick={handleParse}
                disabled={isParsing || !prompt}
                className="w-full py-5 bg-candy-petrol text-white rounded-2xl font-black shadow-xl shadow-candy-petrol/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {/* FIX: Changed isProcessing to isParsing to match the defined state variable */}
                {isParsing ? 'Thinking...' : 'Analyze with Gemini ✨'}
              </button>

              {parsedPreview && (
                <div className="mt-8 p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black text-candy-aqua uppercase tracking-[0.3em]">Parsed Structured Rule</h4>
                      <p className="text-xl font-black mt-2 capitalize">{parsedPreview.triggerType.replace('_', ' ')}</p>
                    </div>
                    <span className="text-3xl">🧩</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <p className="text-[8px] font-black text-white/40 uppercase">Escalation</p>
                       <p className="text-xs font-bold">{parsedPreview.escalationTarget}</p>
                    </div>
                    {parsedPreview.deadlineTime && (
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-white/40 uppercase">Deadline</p>
                        <p className="text-xs font-bold">{parsedPreview.deadlineTime}</p>
                      </div>
                    )}
                    {parsedPreview.maxDurationMinutes && (
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-white/40 uppercase">Duration</p>
                        <p className="text-xs font-bold">{parsedPreview.maxDurationMinutes}m</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={confirmRule}
                    className="w-full py-4 bg-candy-aqua text-candy-petrol rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-candy-aqua/20"
                  >
                    Activate Monitoring
                  </button>
                </div>
              )}
           </div>
        </div>

        {/* Rule List */}
        <div className="lg:col-span-7 space-y-8">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
             <span className="w-8 h-1 bg-candy-petrol rounded-full"></span> Active Directives
           </h3>

           {rules.length === 0 ? (
             <div className="bg-white p-20 rounded-[4rem] border-4 border-dashed border-slate-50 text-center">
                <span className="text-6xl opacity-10">🛡️</span>
                <p className="text-slate-300 font-black italic mt-6">No supervisor rules defined. System is manually operated.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {rules.map(rule => (
                  <div key={rule.id} className={`p-8 rounded-[3rem] bg-white border-2 transition-all flex items-center justify-between group ${rule.isActive ? 'border-candy-petrol/20 shadow-sm' : 'border-slate-50 opacity-50 shadow-inner'}`}>
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${rule.isActive ? 'bg-candy-mint text-candy-petrol' : 'bg-slate-100 text-slate-400'}`}>
                         {rule.structuredRule.triggerType === TriggerType.DEADLINE_MISSED ? '⏰' : 
                          rule.structuredRule.triggerType === TriggerType.STILL_RUNNING ? '⏳' : '🚫'}
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-lg">"{rule.ruleText}"</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                             Target: {workflows.find(w => w.id === rule.workflowId)?.title} • Type: {rule.structuredRule.triggerType}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                        onClick={() => onToggleRule(rule.id)}
                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${rule.isActive ? 'bg-candy-petrol text-white' : 'bg-slate-100 text-slate-400'}`}
                       >
                         {rule.isActive ? 'Active' : 'Paused'}
                       </button>
                       <button 
                        onClick={() => onDeleteRule(rule.id)}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-200 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                       >
                         🗑️
                       </button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AIAlerts;
