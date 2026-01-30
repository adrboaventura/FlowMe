
import React from 'react';
import { AppNotification, Workflow } from '../types';

interface NotificationInboxProps {
  notifications: AppNotification[];
  workflows: Workflow[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationInbox: React.FC<NotificationInboxProps> = ({ notifications, workflows, onMarkRead, onClearAll }) => {
  const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
  const activeAlerts = sorted.filter(n => n.type === 'reminder' && !n.read);
  const logs = sorted.filter(n => n.type === 'completion' || n.read);

  const getWorkflowTitle = (id: string) => workflows.find(w => w.id === id)?.title || "Unknown Flow";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Alert Center</h2>
          <p className="text-candy-petrol font-black uppercase text-[10px] tracking-[0.4em] mt-3">Operational Heartbeat</p>
        </div>
        <button 
          onClick={onClearAll}
          className="px-6 py-3 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-red-400 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
            <span className="w-8 h-1 bg-red-400 rounded-full animate-pulse"></span>
            Active Operational Alerts
          </h3>
          
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="bg-white p-20 rounded-[3.5rem] text-center border-4 border-dashed border-slate-50">
                <span className="text-6xl opacity-10">🛡️</span>
                <p className="text-slate-300 font-black italic mt-6">No active reminders. System stable.</p>
              </div>
            ) : (
              activeAlerts.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => onMarkRead(n.id)}
                  className="bg-white p-8 rounded-[2.5rem] border-2 border-red-100 shadow-xl shadow-red-500/5 flex items-center gap-8 group cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 animate-pulse shadow-lg shadow-red-500/20">
                    🔔
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-xl text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-red-400 font-black uppercase tracking-widest px-3 py-1 bg-red-50 rounded-full">Urgent</span>
                    </div>
                    <p className="text-slate-500 font-medium mt-1">{n.message}</p>
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-4">
                      {new Date(n.timestamp).toLocaleTimeString()} • Workflow: {getWorkflowTitle(n.workflowId)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
            <span className="w-8 h-1 bg-slate-200 rounded-full"></span>
            Activity Log
          </h3>
          <div className="space-y-3">
            {logs.map(n => (
              <div key={n.id} className="bg-white/60 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-xl">{n.type === 'completion' ? '✅' : '🔔'}</span>
                <div>
                  <p className="font-black text-slate-700 text-xs">{n.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-1">{n.message}</p>
                  <p className="text-[8px] text-slate-300 font-black uppercase mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationInbox;
