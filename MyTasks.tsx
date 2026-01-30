
import React, { useState } from 'react';
import { Workflow, WorkflowRunStatus, WorkflowInstance, User } from '../types';
import { t } from '../services/i18n';

interface MyTasksProps {
  user: User;
  workflows: Workflow[];
  activeRuns: WorkflowRunStatus[];
  history: WorkflowInstance[];
  onResume: (run: WorkflowRunStatus) => void;
  onLaunch: (wf: Workflow) => void;
}

const MyTasks: React.FC<MyTasksProps> = ({ user, workflows, activeRuns, history, onResume, onLaunch }) => {
  const [showLaunchMenu, setShowLaunchMenu] = useState(false);
  const lang = user.preferredLanguage || 'en';

  const taskWorkflows = workflows.filter(w => w.isTaskFlow);
  const activeTasks = activeRuns.filter(r => workflows.find(w => w.id === r.workflowId)?.isTaskFlow);
  const completedToday = history.filter(h => workflows.find(w => w.id === h.workflowId)?.isTaskFlow && new Date(h.timestamp).toDateString() === new Date().toDateString());
  const unstartedTasks = taskWorkflows.filter(wf => !activeTasks.some(r => r.workflowId === wf.id) && !completedToday.some(h => h.workflowId === wf.id));

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32 pt-8">
      <div className="flex justify-end">
        <button onClick={() => setShowLaunchMenu(!showLaunchMenu)} className="px-10 py-5 bg-candy-petrol text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-candy-petrol/20 active:scale-95">
          <span>{showLaunchMenu ? '✕ Close Selection' : '＋ Launch New Mission'}</span>
        </button>
      </div>

      {showLaunchMenu && (
        <div className="p-10 bg-white rounded-[3.5rem] border-4 border-candy-mint shadow-soft animate-in zoom-in-95">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taskWorkflows.map(wf => (
                <button key={wf.id} onClick={() => { onLaunch(wf); setShowLaunchMenu(false); }} className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-candy-petrol hover:bg-white transition-all text-left group">
                   <p className="font-black text-slate-800 text-lg group-hover:text-candy-petrol">{wf.title}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Deploy Protocol →</p>
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
              <span className="w-8 h-1 bg-candy-petrol rounded-full animate-pulse"></span>
              Current Mission Status
            </h3>
            <div className="grid grid-cols-1 gap-6">
               {unstartedTasks.map(wf => (
                 <div key={wf.id} className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm flex items-center justify-between group">
                    <div>
                        <p className="font-black text-slate-800 text-xl">{wf.title}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pending Start</p>
                    </div>
                    <button onClick={() => onLaunch(wf)} className="px-8 py-4 bg-candy-petrol text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Start Task</button>
                 </div>
               ))}
               {activeTasks.map(run => (
                 <div key={run.id} className="bg-candy-mint p-10 rounded-[3rem] border-4 border-white shadow-xl flex items-center justify-between animate-pulse">
                    <p className="font-black text-slate-800 text-xl">{workflows.find(w => w.id === run.workflowId)?.title}</p>
                    <button onClick={() => onResume(run)} className="px-8 py-4 bg-white text-candy-petrol rounded-2xl font-black text-[10px] uppercase shadow-sm">Resume</button>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default MyTasks;
