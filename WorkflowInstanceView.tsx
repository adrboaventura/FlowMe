
import React, { useState, useMemo, useRef } from 'react';
import { Workflow, FieldType, WorkflowInstance, WorkflowField, RunStatus, WorkflowRunStatus, MasterDataTable, LayoutMode } from '../types';
import { t } from '../services/i18n';
import { geminiService } from '../services/geminiService';

interface WorkflowInstanceViewProps {
  workflow: Workflow;
  user?: any; 
  masterTables: MasterDataTable[];
  existingRun?: WorkflowRunStatus;
  onUpdateLifecycle: (run: WorkflowRunStatus) => void;
  onComplete: (instance: WorkflowInstance) => void;
  onCancel: () => void;
  onOpenChat: (roomId: string) => void;
  isRemote?: boolean;
}

/**
 * WORKFLOW INSTANCE VIEW
 * Refined with a minimalistic "Header Snackbar" that stays out of the way,
 * especially on mobile devices.
 */
const WorkflowInstanceView: React.FC<WorkflowInstanceViewProps> = ({ 
  workflow, user, masterTables, onComplete, onCancel 
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiVerdict, setAiVerdict] = useState<{verdict: string, wowFactor: boolean} | null>(null);
  
  const lang = user?.preferredLanguage || 'en';

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    workflow.fields.forEach(f => {
      if (f.validation?.required && !formData[f.id]) {
        newErrors[f.id] = 'Required';
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    return !hasErrors;
  };

  const handleProceed = () => {
    if (!validateAll()) return;
    if (workflow.enableReviewBeforeSubmit && !isReviewing) {
      setIsReviewing(true);
      window.scrollTo(0,0);
    } else {
      finalize();
    }
  };

  const handleJudgeAssistant = async () => {
    setIsAnalyzing(true);
    setAiVerdict(null);
    try {
      const scores = {
        impact: formData['score_impact'],
        tech: formData['score_tech'],
        creativity: formData['score_creativity']
      };
      const verdict = await geminiService.getJudgeVerdict(scores, "Reviewing submission metadata and scored criteria.");
      setAiVerdict(verdict);
    } catch (err) {
      alert("AI Judge is offline. Manual scoring required.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const finalize = () => {
    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      workflowId: workflow.id,
      data: formData,
      timestamp: Date.now(),
      attachments: {},
      userId: user?.id || 'guest',
      responderName: user?.name || 'Guest',
      responderType: 'owner',
      durationMs: 0,
      completedByUserName: user?.name || 'Guest',
      isSynced: false
    });
  };

  return (
    <div className="min-h-screen bg-candy-mint/30 relative">
      {/* MINIMAL HEADER SNACKBAR: User-centric header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-center no-print">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-heavy border border-white/10 max-w-lg w-full animate-in slide-in-from-top-4 duration-500">
          <img src={user?.picture} className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0" alt="Identity" />
          <div className="flex-1 overflow-hidden">
            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-candy-petrol leading-none mb-0.5">Active Mission</p>
            <h2 className="text-xs font-bold truncate leading-none">{workflow.title}</h2>
          </div>
          <button 
            onClick={onCancel} 
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-24 px-6 pb-40 animate-in fade-in">
        {isReviewing ? (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="text-center mb-10">
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{t('verify_mission', lang)}</h3>
                <p className="text-slate-400 font-bold italic mt-2 text-sm">Audit submissions for the Gemini 3 Hackathon.</p>
             </div>
             
             {workflow.fields.map(f => (
               <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center group shadow-sm">
                  <div>
                     <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{f.label}</p>
                     <p className="font-bold text-slate-700">{formData[f.id] || "—"}</p>
                  </div>
                  <button onClick={() => setIsReviewing(false)} className="text-candy-petrol text-[10px] font-black uppercase underline hover:text-slate-800 transition-colors">Edit</button>
               </div>
             ))}

             {workflow.title.includes('Hackathon') && (
               <div className="p-8 bg-white rounded-[2.5rem] border-4 border-candy-mint shadow-soft space-y-6 mt-8">
                  <div className="flex items-center justify-between">
                     <h4 className="text-xl font-black text-slate-800 tracking-tight">AI Judge Assistant</h4>
                     <span className="text-2xl animate-float">✨</span>
                  </div>
                  {aiVerdict ? (
                    <div className="animate-in fade-in duration-1000">
                      <p className="text-sm italic font-medium text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">"{aiVerdict.verdict}"</p>
                      {aiVerdict.wowFactor && (
                        <div className="bg-candy-petrol text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block animate-bounce shadow-lg shadow-candy-petrol/20">
                           WOW FACTOR DETECTED ⚡
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={handleJudgeAssistant}
                      disabled={isAnalyzing}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-black transition-all"
                    >
                      {isAnalyzing ? 'Analyzing Submission...' : 'Get Executive AI Verdict'}
                    </button>
                  )}
               </div>
             )}

             <button onClick={finalize} className="w-full py-8 bg-slate-800 text-white rounded-[2.5rem] font-black text-xl shadow-heavy mt-10 active:scale-95 transition-all">
                {t('conclude', lang)}
             </button>
          </div>
        ) : (
          <div className="space-y-10">
            {workflow.fields.map(f => (
              <div key={f.id} className="space-y-4">
                 <div className="flex justify-between items-baseline px-2">
                   <label className="text-xs font-black text-slate-600 uppercase tracking-widest">{f.label}</label>
                   {f.validation?.required && <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest">{t('required', lang)}</span>}
                 </div>
                 {f.type === FieldType.MASTER_DATA ? (
                   <div className="relative group">
                     <select 
                       value={formData[f.id] || ''} 
                       onChange={(e) => setFormData({...formData, [f.id]: e.target.value})}
                       className="w-full px-6 py-5 bg-white rounded-2xl border-2 border-slate-100 font-bold text-slate-700 outline-none focus:border-candy-petrol/30 appearance-none shadow-sm transition-all"
                     >
                       <option value="">Select from Registry...</option>
                       {masterTables.find(t => t.id === f.masterDataRef)?.rows.map((r, i) => (
                         <option key={i} value={r.cat || r.name}>{r.cat || r.name}</option>
                       ))}
                     </select>
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-xs">▼</div>
                   </div>
                 ) : f.type === FieldType.CHECKBOX ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {f.options?.map(opt => (
                        <label key={opt} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 cursor-pointer hover:bg-candy-mint hover:border-candy-petrol/20 transition-all shadow-sm">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 accent-candy-petrol" 
                             checked={(formData[f.id] || []).includes(opt)}
                             onChange={(e) => {
                               const current = formData[f.id] || [];
                               const next = e.target.checked ? [...current, opt] : current.filter((o:string) => o !== opt);
                               setFormData({...formData, [f.id]: next});
                             }}
                           />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{opt}</span>
                        </label>
                      ))}
                    </div>
                 ) : (
                   <input 
                     type={f.type === FieldType.NUMBER ? 'number' : 'text'}
                     value={formData[f.id] || ''}
                     onChange={(e) => setFormData({...formData, [f.id]: e.target.value})}
                     className={`w-full px-6 py-5 bg-white rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 shadow-sm ${errors[f.id] ? 'border-red-100' : 'border-slate-50 focus:border-candy-petrol/30'}`}
                     placeholder={f.placeholder}
                   />
                 )}
              </div>
            ))}
            <div className="pt-10 space-y-4">
               <button onClick={handleProceed} className="w-full py-8 bg-candy-petrol text-white rounded-[2.5rem] font-black text-xl shadow-lg active:scale-95 transition-all shadow-candy-petrol/20">
                  {workflow.enableReviewBeforeSubmit ? t('review_answers', lang) : t('conclude', lang)}
               </button>
               <p className="text-center text-[8px] font-black text-slate-200 uppercase tracking-[0.4em]">{t('errors_block', lang)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowInstanceView;
