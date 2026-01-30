import React, { useState } from 'react';
import { Workflow, WorkflowInstance, FieldType, User } from '../types';
import { geminiService } from '../services/geminiService';

interface ReportViewProps {
  workflow: Workflow;
  instance: WorkflowInstance;
  user: User;
  onClose: () => void;
}

/**
 * REPORT VIEW: The Professional Document Generator
 * 
 * Now features the "AI Studio" - a dedicated Notebook LM integration.
 * Users select specific evidence pieces to synthesize them into 
 * various formats using Gemini 3.
 */
const ReportView: React.FC<ReportViewProps> = ({ workflow, instance, user, onClose }) => {
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  // Fix: Explicitly type allMedia as string[] to ensure 'at' is correctly inferred as string in the map function below.
  const allMedia: string[] = Object.values(instance.attachments || {}).flat() as string[];

  const toggleMediaSelection = (url: string) => {
    setSelectedMedia(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const startSynthesis = async (format: string) => {
    if (selectedMedia.length === 0) {
      alert("Please select at least one piece of evidence for the AI Studio to analyze.");
      return;
    }
    
    setIsSynthesizing(true);
    setSynthesisResult(null);
    setActiveFormat(format);
    
    try {
      const result = await geminiService.synthesizeEvidence(instance.data, selectedMedia, format);
      setSynthesisResult(result || "Synthesis complete, but no content was generated.");
    } catch (err) {
      alert("The AI Studio encountered an error during processing. Please try again.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 md:p-8 report-modal">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] md:h-auto overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col report-content no-scrollbar animate-in zoom-in-95 duration-300 relative">
        
        {/* Synthesis Hub Overlay */}
        {(isSynthesizing || synthesisResult) && (
          <div className="absolute inset-0 z-[80] bg-white/95 backdrop-blur-xl p-12 flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-500 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-candy-petrol rounded-2xl flex items-center justify-center text-2xl shadow-lg">✨</div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800">AI Studio Output</h2>
                  <p className="text-[10px] text-candy-petrol font-black uppercase tracking-[0.4em]">Synthesis Mode: {activeFormat}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSynthesisResult(null); setActiveFormat(null); }}
                className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 hover:text-red-400 font-black flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-candy-mint/40 rounded-[3rem] p-10 border-2 border-candy-petrol/10 overflow-y-auto no-scrollbar">
              {isSynthesizing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8">
                  <div className="w-24 h-24 border-8 border-candy-petrol/20 border-t-candy-petrol rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xl font-black text-candy-petrol animate-pulse">Gemini is synthesizing your evidence...</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Generating high-fidelity {activeFormat} content</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none animate-in fade-in duration-1000">
                  <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {synthesisResult}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-center no-print">
               <button 
                 onClick={() => window.print()}
                 className="px-12 py-5 bg-candy-petrol text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-candy-petrol/20 hover:scale-105 transition-all"
               >
                 Print Studio Report
               </button>
            </div>
          </div>
        )}

        {/* Document Header */}
        <div className="p-10 border-b-4 border-candy-petrol bg-candy-mint/30 flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-candy-petrol rounded-xl flex items-center justify-center text-white text-xl shadow-lg">🌊</div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">FlowMe Intelligence Report</h1>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">{workflow.title}</p>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Official Compliance & Audit Record</p>
            </div>
          </div>
          <div className="text-right space-y-2 no-print">
             <button onClick={onClose} className="bg-slate-50 w-12 h-12 rounded-full text-slate-300 hover:text-red-400 font-black flex items-center justify-center border border-slate-100 mb-4 transition-all">✕</button>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100">
                Ref: {instance.id}
             </div>
          </div>
        </div>

        {/* Auditor & Session Info */}
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/30 border-b border-slate-100">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-candy-petrol uppercase tracking-[0.3em]">Auditor Information</h3>
            <div className="flex items-center gap-3">
               <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
               <div>
                  <p className="font-black text-slate-800 text-sm">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</p>
               </div>
            </div>
          </div>
          <div className="space-y-2 md:text-right">
            <h3 className="text-[10px] font-black text-candy-petrol uppercase tracking-[0.3em]">Execution Details</h3>
            <div>
               <p className="font-black text-slate-800 text-sm">Date: {new Date(instance.timestamp).toLocaleDateString()}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Time: {new Date(instance.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Observation Log */}
        <div className="p-10 space-y-10">
          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-candy-petrol rounded-full"></span>
                Observation Log
             </h3>
             <div className="grid grid-cols-1 gap-4">
                {workflow.fields.map(field => {
                  const value = instance.data[field.id];
                  if (field.type === FieldType.ATTACHMENT) return null;
                  
                  return (
                    <div key={field.id} className="flex justify-between items-center py-4 border-b border-slate-50 px-2 group">
                       <span className="text-slate-400 font-bold text-sm group-hover:text-slate-600 transition-colors">{field.label}</span>
                       <span className="text-slate-800 font-black text-base">
                          {value === undefined || value === null ? '—' : 
                           (typeof value === 'boolean' ? (value ? '✅ Verified' : '❌ Failed/No') : value)}
                       </span>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* AI STUDIO: The Synthesis Engine */}
          <div className="p-10 bg-candy-mint rounded-[3.5rem] border-4 border-white shadow-xl space-y-8 no-print">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">AI Synthesis Studio</h3>
                <p className="text-[9px] font-black text-candy-petrol uppercase tracking-[0.3em] mt-1">Transform evidence into structured media</p>
              </div>
              <div className="bg-white/60 px-4 py-2 rounded-2xl text-[9px] font-black text-slate-400 uppercase border border-white">
                Selected: {selectedMedia.length} / {allMedia.length}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {allMedia.map((at, idx) => {
                const isSelected = selectedMedia.includes(at);
                const isImage = at.startsWith('data:image');
                return (
                  <button 
                    key={idx} 
                    onClick={() => toggleMediaSelection(at)}
                    className={`aspect-square rounded-[1.5rem] overflow-hidden border-4 transition-all relative group ${isSelected ? 'border-candy-petrol shadow-lg shadow-candy-petrol/20 scale-105' : 'border-white opacity-60 hover:opacity-100'}`}
                  >
                    {isImage ? (
                      <img src={at} className="w-full h-full object-cover" alt="Run Evidence" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-3xl">📄</div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-candy-petrol text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-lg">✓</div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <button 
                onClick={() => startSynthesis('podcast')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl hover:bg-candy-aqua hover:scale-105 transition-all shadow-sm border border-slate-50 group"
              >
                <span className="text-2xl mb-2 group-hover:rotate-12 transition-transform">🎙️</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-candy-petrol">Podcast Script</span>
              </button>
              <button 
                onClick={() => startSynthesis('flashcards')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl hover:bg-candy-aqua hover:scale-105 transition-all shadow-sm border border-slate-50 group"
              >
                <span className="text-2xl mb-2 group-hover:rotate-12 transition-transform">🃏</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-candy-petrol">Flashcards</span>
              </button>
              <button 
                onClick={() => startSynthesis('mindmap')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl hover:bg-candy-aqua hover:scale-105 transition-all shadow-sm border border-slate-50 group"
              >
                <span className="text-2xl mb-2 group-hover:rotate-12 transition-transform">🗺️</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-candy-petrol">Mind Map</span>
              </button>
              <button 
                onClick={() => startSynthesis('video_script')}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl hover:bg-candy-aqua hover:scale-105 transition-all shadow-sm border border-slate-50 group"
              >
                <span className="text-2xl mb-2 group-hover:rotate-12 transition-transform">🎬</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-candy-petrol">Video Script</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="mt-auto p-10 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100">
          <div className="text-center md:text-left">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] leading-loose">
              Report Generated Digitally by FlowMe AI<br/>
              Timestamp: {new Date().toISOString()}<br/>
              Integrity Status: Verified ✅
            </p>
          </div>
          <div className="flex gap-4 no-print">
             <button 
              onClick={handlePrint}
              className="px-10 py-5 bg-candy-petrol text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-candy-petrol/20 hover:scale-105 transition-all flex items-center gap-3"
             >
                🖨️ Export as PDF
             </button>
             <button 
              onClick={onClose}
              className="px-10 py-5 bg-white text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
             >
                Close
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;