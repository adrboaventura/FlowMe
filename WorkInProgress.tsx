
import React from 'react';
import { Workflow, WorkflowRunStatus } from '../types';

interface WIPProps {
  runs: WorkflowRunStatus[];
  workflows: Workflow[];
  onResume: (run: WorkflowRunStatus) => void;
  onAbort: (runId: string) => void;
}

const WorkInProgress: React.FC<WIPProps> = ({ runs, workflows, onResume, onAbort }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Mission Control</h2>
          <p className="text-candy-petrol font-black uppercase text-[10px] tracking-[0.4em] mt-3">Active Operational Threads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {runs.length === 0 ? (
          <div className="col-span-full py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center text-center">
             <span className="text-6xl grayscale opacity-20 mb-6">🏜️</span>
             <h3 className="text-2xl font-black text-slate-300 tracking-tight">Zero Active Missions</h3>
             <p className="text-slate-300 font-bold italic mt-2 opacity-60">All business processes are currently concluded.</p>
          </div>
        ) : (
          runs.map(run => {
            const wf = workflows.find(w => w.id === run.workflowId);
            const isStandby = run.status === 'standby';
            const durationMins = Math.floor((Date.now() - run.startedAt) / 60000);
            
            return (
              <div key={run.id} className={`p-10 rounded-[3.5rem] bg-white border-2 transition-all group flex flex-col justify-between min-h-[320px] ${isStandby ? 'border-amber-100' : 'border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2'}`}>
                <div className="flex justify-between items-start">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-sm ${isStandby ? 'bg-amber-100 text-amber-600' : 'bg-candy-mint text-candy-petrol animate-pulse'}`}>
                    {isStandby ? '⏸️' : '🚀'}
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isStandby ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-candy-aqua text-candy-petrol border-candy-petrol/20'}`}>
                      {run.status}
                    </span>
                    <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-widest">{durationMins}m Active</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-2xl font-black text-slate-800 leading-tight">{wf?.title || 'Unknown Mission'}</h4>
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">Started by {run.startedByName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                   <button 
                    onClick={() => onResume(run)}
                    className="flex-1 py-4 bg-candy-petrol text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-candy-petrol/20 hover:scale-105 transition-all"
                   >
                     Resume Workflow
                   </button>
                   <button 
                    onClick={() => onAbort(run.id)}
                    className="py-4 bg-red-50 text-red-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
                   >
                     Abort Run
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WorkInProgress;
