
import React, { useState, useMemo } from 'react';
import { Workflow, Group, WorkflowInstance, WorkflowRunStatus, WorkflowAssignment, TriggerType, WorkflowAlertRule } from '../types';
import { geminiService } from '../services/geminiService';

interface CommandCenterProps {
  user: any;
  workflows: Workflow[];
  groups: Group[];
  activeRuns: WorkflowRunStatus[];
  history: WorkflowInstance[];
  assignments: WorkflowAssignment[];
  alertRules: WorkflowAlertRule[];
  onAddAssignment: (assignment: Omit<WorkflowAssignment, 'id' | 'createdAt' | 'isActive'>) => void;
  onDeleteAssignment: (id: string) => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ 
  user, workflows, groups, activeRuns, history, assignments, alertRules,
  onAddAssignment, onDeleteAssignment 
}) => {
  const [assignPrompt, setAssignPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedAssignment, setParsedAssignment] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Metrics Logic
  const completedToday = useMemo(() => history.filter(h => 
    new Date(h.timestamp).toDateString() === new Date().toDateString()
  ).length, [history]);

  const activeCount = activeRuns.length;

  const overdueCount = useMemo(() => {
    const now = Date.now();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    let count = 0;
    
    // Check Deadline Rules
    alertRules.forEach(rule => {
      if (!rule.isActive || rule.structuredRule.triggerType !== TriggerType.DEADLINE_MISSED) return;
      if (timeStr >= (rule.structuredRule.deadlineTime || "23:59")) {
        const done = history.some(h => h.workflowId === rule.workflowId && new Date(h.timestamp).toDateString() === new Date().toDateString());
        if (!done) count++;
      }
    });

    // Check Still Running (Duration)
    activeRuns.forEach(run => {
      const rule = alertRules.find(r => r.workflowId === run.workflowId && r.isActive && r.structuredRule.triggerType === TriggerType.STILL_RUNNING);
      if (rule) {
        const durationMins = (now - run.startedAt) / 60000;
        if (durationMins > (rule.structuredRule.maxDurationMinutes || 30)) count++;
      }
    });

    return count;
  }, [activeRuns, alertRules, history]);

  const handleParseAssignment = async () => {
    if (!assignPrompt.trim()) return;
    setIsParsing(true);
    try {
      const result = await geminiService.parseAssignment(
        assignPrompt, 
        workflows.map(w => w.title), 
        groups.map(g => g.name)
      );
      setParsedAssignment(result);
    } catch (err) {
      alert("Failed to coordinate assignment. Try being more specific!");
    } finally {
      setIsParsing(false);
    }
  };

  const confirmAssignment = () => {
    if (!parsedAssignment) return;
    const wf = workflows.find(w => w.title.toLowerCase().includes(parsedAssignment.workflow_name.toLowerCase()));
    const grp = groups.find(g => g.name.toLowerCase().includes(parsedAssignment.target_group.toLowerCase()));
    
    if (!wf || !grp) return alert("Assignment Error: Could not match Workflow or Group. Please clarify.");

    onAddAssignment({
      workflowId: wf.id,
      targetGroupId: grp.id,
      recurrence: parsedAssignment.recurrence,
      startTime: parsedAssignment.start_time,
      instructionText: assignPrompt
    });
    setAssignPrompt('');
    setParsedAssignment(null);
  };

  const handleGetInsight = async () => {
    setIsAnalyzing(true);
    try {
      const alerts = history.slice(0, 5).map(h => `Completion by ${h.completedByUserName}`);
      const insight = await geminiService.analyzeOperationalRisks(activeCount, overdueCount, completedToday, alerts);
      setAiInsight(insight);
    } catch (err) {
      alert("AI Analyst is currently unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Command Center</h2>
          <p className="text-candy-petrol font-black uppercase text-[10px] tracking-[0.4em] mt-3">Enterprise Operations & AI Oversight</p>
        </div>
        <button 
          onClick={handleGetInsight}
          disabled={isAnalyzing}
          className="px-10 py-5 bg-slate-900 text-white rounded-3xl shadow-xl font-black hover:scale-105 transition-all flex items-center gap-3"
        >
          {isAnalyzing ? 'Analyzing Risks...' : 'Explain Operational Risks ✨'}
        </button>
      </div>

      {aiInsight && (
        <div className="p-10 bg-candy-petrol text-white rounded-[4rem] shadow-2xl animate-in slide-in-from-top-12 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <span>🤖</span> AI Operational Synthesis
            </h3>
            <p className="text-xl font-medium leading-relaxed italic">{aiInsight}</p>
            <button onClick={() => setAiInsight(null)} className="mt-8 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">Dismiss Intelligence</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <MetricCard label="Active Missions" value={activeCount} color="candy-petrol" icon="🚀" />
        <MetricCard label="Overdue / Alerts" value={overdueCount} color="red-400" icon="⚠️" />
        <MetricCard label="Completed Today" value={completedToday} color="candy-aqua" icon="✅" />
        <MetricCard label="Total Personnel" value={groups.length} color="slate-400" icon="👥" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Assignment Interface */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Voice/Text Coordinator</h3>
              <p className="text-xs text-slate-400 font-medium">Assign work by describing the mission goals.</p>
              
              <div className="space-y-2">
                <textarea 
                  value={assignPrompt}
                  onChange={(e) => setAssignPrompt(e.target.value)}
                  placeholder="e.g. Assign Mortality Check to Barn Team A every Monday at 8am..."
                  className="w-full px-8 py-6 bg-slate-50 rounded-3xl border-none outline-none focus:ring-4 focus:ring-candy-petrol/10 min-h-[150px] font-black text-xl placeholder:opacity-20 shadow-inner"
                />
              </div>

              <button 
                onClick={handleParseAssignment}
                disabled={isParsing || !assignPrompt}
                className="w-full py-5 bg-candy-petrol text-white rounded-2xl font-black shadow-xl shadow-candy-petrol/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isParsing ? 'Coordinating...' : 'Interpret Directive ✨'}
              </button>

              {parsedAssignment && (
                <div className="mt-8 p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black text-candy-aqua uppercase tracking-[0.3em]">Coordination Plan</h4>
                      <p className="text-xl font-black mt-2">{parsedAssignment.workflow_name}</p>
                    </div>
                    <span className="text-3xl">📡</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <p className="text-[8px] font-black text-white/40 uppercase">Target Team</p>
                       <p className="text-xs font-bold">{parsedAssignment.target_group}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <p className="text-[8px] font-black text-white/40 uppercase">Recurrence</p>
                       <p className="text-xs font-bold capitalize">{parsedAssignment.recurrence}</p>
                    </div>
                    {parsedAssignment.start_time && (
                      <div className="bg-white/10 p-4 rounded-2xl col-span-2">
                        <p className="text-[8px] font-black text-white/40 uppercase">Daily Trigger</p>
                        <p className="text-xs font-bold">{parsedAssignment.start_time}</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={confirmAssignment}
                    className="w-full py-4 bg-candy-aqua text-candy-petrol rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-candy-aqua/20"
                  >
                    Deploy Assignment
                  </button>
                </div>
              )}
           </div>
        </div>

        {/* Deployment List */}
        <div className="lg:col-span-7 space-y-8">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
             <span className="w-8 h-1 bg-candy-petrol rounded-full"></span> Active Assignments
           </h3>

           {assignments.length === 0 ? (
             <div className="bg-white p-20 rounded-[4rem] border-4 border-dashed border-slate-50 text-center">
                <span className="text-6xl opacity-10">📅</span>
                <p className="text-slate-300 font-black italic mt-6">No recurring missions scheduled.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {assignments.map(item => {
                  const wf = workflows.find(w => w.id === item.workflowId);
                  const grp = groups.find(g => g.id === item.targetGroupId);
                  return (
                    <div key={item.id} className="p-8 rounded-[3rem] bg-white border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-candy-petrol/20 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-candy-mint text-candy-petrol rounded-2xl flex items-center justify-center text-2xl">
                           {item.recurrence === 'daily' ? '🌅' : '📅'}
                         </div>
                         <div>
                            <p className="font-black text-slate-800 text-lg">{wf?.title}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                               Team: {grp?.name} • Frequency: {item.recurrence} {item.startTime ? `@ ${item.startTime}` : ''}
                            </p>
                         </div>
                      </div>
                      <button 
                        onClick={() => onDeleteAssignment(item.id)}
                        className="w-12 h-12 rounded-xl bg-slate-50 text-slate-200 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon }: any) => (
  <div className={`bg-white p-10 rounded-[3rem] shadow-sm border-2 border-slate-50 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-${color}`}>
    <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700`}></div>
    <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] relative z-10">{label}</p>
    <div className="flex items-end justify-between relative z-10">
      <span className="text-6xl font-black text-slate-800">{value}</span>
      <span className="text-3xl p-4 rounded-2xl bg-slate-50">{icon}</span>
    </div>
  </div>
);

export default CommandCenter;
