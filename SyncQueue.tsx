
import React, { useMemo } from 'react';
import { Workflow, WorkflowInstance } from '../types';

interface SyncQueueProps {
  history: WorkflowInstance[];
  workflows: Workflow[];
  isOnline: boolean;
  onSyncAll: () => void;
}

/**
 * SYNC HUB
 * Transparency is key for enterprise operations. Users must know 
 * exactly which data has safely reached the central database.
 */
const SyncQueue: React.FC<SyncQueueProps> = ({ history, workflows, isOnline, onSyncAll }) => {
  const pending = useMemo(() => history.filter(h => !h.isSynced), [history]);
  const synced = useMemo(() => history.filter(h => h.isSynced), [history]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Sync Hub</h2>
          <p className="text-candy-petrol font-black uppercase text-[10px] tracking-[0.4em] mt-3">Offline Persistence Engine</p>
        </div>
        <div className="flex items-center gap-4">
           <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOnline ? 'bg-candy-mint text-candy-petrol border-candy-petrol/20' : 'bg-red-50 text-red-400 border-red-100'}`}>
              {isOnline ? '● Network Online' : '○ Network Offline'}
           </div>
           {pending.length > 0 && isOnline && (
             <button onClick={onSyncAll} className="px-8 py-4 bg-candy-petrol text-white rounded-2xl shadow-xl font-black text-xs uppercase">Sync All</button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50">
           <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">In Local Queue</p>
           <div className="flex items-end justify-between mt-4">
              <span className="text-6xl font-black text-slate-800">{pending.length}</span>
              <span className="text-4xl text-candy-petrol">📤</span>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50">
           <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Cloud Verified</p>
           <div className="flex items-end justify-between mt-4">
              <span className="text-6xl font-black text-slate-800">{synced.length}</span>
              <span className="text-4xl text-candy-aqua">☁️</span>
           </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-4">
          <span className="w-8 h-1 bg-candy-petrol rounded-full"></span>
          Operational Audit Trail
        </h3>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <p className="text-2xl font-black">No activity logs yet.</p>
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="p-8 rounded-[2.5rem] bg-slate-50/50 flex items-center justify-between border-2 border-white">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${item.isSynced ? 'bg-candy-aqua text-candy-petrol' : 'bg-amber-100 text-amber-600'}`}>
                    {item.isSynced ? '✓' : '⚡'}
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{workflows.find(w => w.id === item.workflowId)?.title || "Unknown"}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      {item.isSynced ? 'Cloud Verified' : 'Stored Locally (Offline)'} • {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!item.isSynced && isOnline && (
                  <button className="bg-white px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm">Sync One</button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncQueue;
