
import React, { useState, useEffect, useMemo } from 'react';
import { Workflow, WorkflowInstance, WorkflowField } from '../types';
import { geminiService } from '../services/geminiService';

interface ComparisonViewProps {
  workflow: Workflow;
  instanceA: WorkflowInstance;
  instanceB: WorkflowInstance;
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ workflow, instanceA, instanceB, onClose }) => {
  const [insight, setInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Score Calculation (Weighted)
  const calculateScore = (data: any) => {
    const impact = Number(data['score_impact'] || 0) * 0.4;
    const tech = Number(data['score_tech'] || 0) * 0.3;
    const creativity = Number(data['score_creativity'] || 0) * 0.2;
    const features = ((data['gemini_features'] || []).length * 0.2); // Bonus
    return (impact + tech + creativity + Math.min(features, 1.0)).toFixed(2);
  };

  const scoreA = useMemo(() => calculateScore(instanceA.data), [instanceA]);
  const scoreB = useMemo(() => calculateScore(instanceB.data), [instanceB]);
  const isAWinner = Number(scoreA) >= Number(scoreB);

  useEffect(() => {
    const analyze = async () => {
      try {
        const result = await geminiService.compareInstances(instanceA, instanceB, workflow.title);
        setInsight(result || 'Analysis complete. No significant trends detected.');
      } catch (err) {
        setInsight('The AI Analyst encountered an error during synthesis.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    analyze();
  }, [workflow, instanceA, instanceB]);

  const renderValue = (field: WorkflowField, data: any) => {
    const val = data[field.id];
    if (val === undefined || val === null) return <span className="text-slate-300 italic">No Data</span>;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? '✅ Yes' : '❌ No';
    return String(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-candy-mint w-full max-w-7xl h-full max-h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-white">
        
        {/* Header */}
        <div className="p-8 md:p-12 bg-white flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">AI Comparison Verdict</h2>
            <p className="text-[10px] text-candy-petrol font-black uppercase tracking-[0.4em] mt-2">
              Deep Evaluation: {workflow.title}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-16 h-16 rounded-[2rem] bg-slate-50 text-slate-300 hover:text-red-400 font-black flex items-center justify-center transition-all border border-slate-100 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Raw Data Panels */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-10 rounded-[3rem] shadow-sm border-4 transition-all relative ${isAWinner ? 'bg-white border-candy-petrol' : 'bg-slate-50/50 border-transparent opacity-80'}`}>
                {isAWinner && <div className="absolute top-0 right-0 bg-candy-petrol text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">HIGHEST SCORE</div>}
                <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                  <div>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Submission A</h3>
                     <p className="text-xl font-black text-slate-800">{instanceA.data['proj_name'] || 'Untitled'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-candy-petrol">{scoreA}</p>
                    <p className="text-[8px] font-black uppercase opacity-40">Weighted Score</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {workflow.fields.map(field => (
                    <div key={field.id} className="group">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1 transition-colors group-hover:text-candy-petrol">{field.label}</p>
                      <p className="font-bold text-slate-700 text-sm">{renderValue(field, instanceA.data)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-10 rounded-[3rem] shadow-sm border-4 transition-all relative ${!isAWinner ? 'bg-white border-candy-petrol' : 'bg-slate-50/50 border-transparent opacity-80'}`}>
                {!isAWinner && <div className="absolute top-0 right-0 bg-candy-petrol text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">HIGHEST SCORE</div>}
                <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                   <div>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Submission B</h3>
                     <p className="text-xl font-black text-slate-800">{instanceB.data['proj_name'] || 'Untitled'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-candy-petrol">{scoreB}</p>
                    <p className="text-[8px] font-black uppercase opacity-40">Weighted Score</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {workflow.fields.map(field => (
                    <div key={field.id} className="group">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1 transition-colors group-hover:text-candy-petrol">{field.label}</p>
                      <p className="font-bold text-slate-700 text-sm">{renderValue(field, instanceB.data)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-candy-petrol p-12 rounded-[3.5rem] shadow-2xl shadow-candy-petrol/30 text-white flex-1 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-10">
                    <span className="text-4xl">⚖️</span>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Judging Logic</h3>
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60">Synthesized by Gemini 3</p>
                    </div>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                      <div className="w-20 h-20 border-8 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <p className="font-black text-sm uppercase tracking-[0.3em] animate-pulse">Running Calculations...</p>
                    </div>
                  ) : (
                    <div className="flex-1 text-sm font-medium leading-relaxed italic animate-in fade-in duration-1000 overflow-y-auto no-scrollbar prose prose-invert">
                      {insight.split('\n').map((line, i) => (
                         <p key={i} className="mb-4">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4 shrink-0 no-print">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-candy-petrol text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-candy-petrol/20 hover:scale-105 transition-all"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
