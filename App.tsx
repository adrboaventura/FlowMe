
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import WorkflowBuilder from './components/WorkflowBuilder';
import WorkflowInstanceView from './components/WorkflowInstanceView';
import AIAssistant from './components/AIAssistant';
import ComparisonView from './components/ComparisonView';
import Login from './components/Login';
import NotificationInbox from './components/NotificationInbox';
import Settings from './components/Settings';
import ChatHub from './components/ChatHub';
import MyTasks from './components/MyTasks';
import { 
  Workflow, MasterDataTable, WorkflowInstance, User, 
  AppNotification, WorkflowRunStatus, Company, 
  ChatMessage, WorkflowAlertRule, WorkflowAssignment, IntegrationConnector,
  LayoutMode, FieldType, VisibilityType, MasterDataColumnType, ChatRoom
} from './types';
import { t } from './services/i18n';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGuest, setIsGuest] = useState(false);
  const [company, setCompany] = useState<Company>({ id: 'c1', name: 'North Creek Farms', createdAt: Date.now(), syncMode: 'auto' });
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [masterTables, setMasterTables] = useState<MasterDataTable[]>([]);
  const [history, setHistory] = useState<WorkflowInstance[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeRuns, setActiveRuns] = useState<WorkflowRunStatus[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [alertRules, setAlertRules] = useState<WorkflowAlertRule[]>([]);
  const [assignments, setAssignments] = useState<WorkflowAssignment[]>([]);
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // AI Assistant State
  const [aiChatHistory, setAiChatHistory] = useState<ChatMessage[]>([]);

  const [editingWorkflow, setEditingWorkflow] = useState<Partial<Workflow> | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [resumingRun, setResumingRun] = useState<WorkflowRunStatus | undefined>(undefined);
  const [comparisonItems, setComparisonItems] = useState<WorkflowInstance[] | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!user) return;
    const storageKey = isGuest ? `flowme_demo_data` : `flowme_data_${user.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      setWorkflows(data.workflows || []);
      setMasterTables(data.masterTables || []);
      setHistory(data.history || []);
      setNotifications(data.notifications || []);
      setActiveRuns(data.activeRuns || []);
      setChatRooms(data.chatRooms || []);
      setChatMessages(data.chatMessages || []);
      setAlertRules(data.alertRules || []);
      setAssignments(data.assignments || []);
      setConnectors(data.connectors || []);
      setAllUsers(data.allUsers || [user]);
    } else if (isGuest) {
      initDemoData();
    }
  }, [user?.id, isGuest]);

  const initDemoData = () => {
    const demoUsers: User[] = [
      user!,
      { id: 'u_sarah', name: 'Sarah UX', email: 'sarah@flowme.ai', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', role: 1 as any, companyId: 'c1' },
      { id: 'u_mark', name: 'Mark Biz', email: 'mark@flowme.ai', picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark', role: 2 as any, companyId: 'c1' },
      { id: 'u_gemini', name: 'Dr. Gemini', email: 'ai@flowme.ai', picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gemini', role: 0 as any, companyId: 'c1' },
    ];

    const demoRooms: ChatRoom[] = [
      { id: 'room_general', name: 'General Ops', type: 'company', companyId: 'c1', targetId: 'c1', createdAt: Date.now() },
      { id: 'room_barn_a', name: 'Barn North A', type: 'group', companyId: 'c1', targetId: 'g1', createdAt: Date.now() },
    ];

    const demoMasterData: MasterDataTable[] = [
      {
        id: 'md_judge_profile', name: 'Judge_Profile', userId: 'guest',
        columns: [
          { id: 'name', name: 'Name', type: MasterDataColumnType.STRING },
          { id: 'specialty', name: 'Specialty', type: MasterDataColumnType.STRING },
          { id: 'active', name: 'Active', type: MasterDataColumnType.BOOLEAN },
        ],
        rows: [
          { name: 'Dr. Gemini', specialty: 'AI', active: true },
          { name: 'Sarah UX', specialty: 'UX', active: true },
          { name: 'Mark Biz', specialty: 'Business', active: true },
        ]
      },
      {
        id: 'md_hackathon_cat', name: 'Hackathon_Categories', userId: 'guest',
        columns: [{ id: 'cat', name: 'Category', type: MasterDataColumnType.STRING }],
        rows: [{ cat: 'Productivity' }, { cat: 'Social Impact' }, { cat: 'Enterprise' }]
      }
    ];

    const demoFlows: Workflow[] = [
      {
        id: 'hack_judge_001', 
        title: 'Gemini 3 Hackathon Judge', 
        description: 'Professional evaluation form.',
        category: 'Hackathon', layout: LayoutMode.PAGINATED, userId: 'guest', createdAt: Date.now(),
        fields: [
          { id: 'proj_name', label: 'Project Name', type: FieldType.TEXT, required: true },
          { id: 'proj_cat', label: 'Category', type: FieldType.MASTER_DATA, masterDataRef: 'md_hackathon_cat', required: true },
          { id: 'score_impact', label: 'Impact (1-10)', type: FieldType.NUMBER, required: true }
        ],
        visibilityType: VisibilityType.PERSONAL, sharedGroupIds: [], notificationsEnabled: false, notificationIntervalMinutes: 30, notifyGroup: false, notifySpecificUserIds: [], enableReviewBeforeSubmit: true, isTaskFlow: true, taskReminderEnabled: false
      }
    ];
    
    setAllUsers(demoUsers);
    setChatRooms(demoRooms);
    setMasterTables(demoMasterData);
    setWorkflows(demoFlows);
  };

  const saveToLocal = () => {
    if (!user) return;
    const storageKey = isGuest ? `flowme_demo_data` : `flowme_data_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify({ workflows, masterTables, history, notifications, activeRuns, chatRooms, chatMessages, alertRules, assignments, connectors, allUsers }));
  };

  useEffect(() => { saveToLocal(); }, [workflows, masterTables, history, notifications, activeRuns, chatRooms, chatMessages, alertRules, assignments, connectors, allUsers]);

  const handleAddInstance = (instance: WorkflowInstance) => {
    setHistory([instance, ...history]);
    setActiveRuns(activeRuns.filter(r => r.workflowId !== instance.workflowId));
    setActiveWorkflow(null);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const startAIChat = (initialPrompt?: string) => {
    if (initialPrompt) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        roomId: 'ai_assistant',
        senderId: user?.id || 'guest',
        senderName: user?.name || 'Guest',
        senderPicture: user?.picture || '',
        text: initialPrompt,
        timestamp: Date.now(),
        type: 'text'
      };
      setAiChatHistory(prev => [...prev, userMsg]);
    }
    setActiveTab('ai_assistant');
  };

  const handleSendMessage = (roomId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: user!.id,
      senderName: user!.displayName || user!.name,
      senderPicture: user!.picture,
      text,
      timestamp: Date.now(),
      type: 'text'
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handleOpenPrivateChat = (targetUser: User) => {
    const existingRoom = chatRooms.find(r => 
      r.type === 'private' && 
      r.memberIds?.includes(user!.id) && 
      r.memberIds?.includes(targetUser.id)
    );

    if (existingRoom) {
      setActiveTab('chat');
      return; // Room already exists, logic in ChatHub handles activation
    }

    const newRoom: ChatRoom = {
      id: `private_${Math.random().toString(36).substr(2, 9)}`,
      name: targetUser.displayName || targetUser.name,
      type: 'private',
      companyId: company.id,
      targetId: targetUser.id,
      createdAt: Date.now(),
      memberIds: [user!.id, targetUser.id],
      picture: targetUser.picture
    };

    setChatRooms([...chatRooms, newRoom]);
    setActiveTab('chat');
  };

  if (!user) return <Login onLogin={(u, g) => { setUser(u); setIsGuest(!!g); }} />;

  const lang = user.preferredLanguage || 'en';

  return (
    <div className="flex h-screen bg-candy-mint overflow-hidden">
      {!activeWorkflow && activeTab !== 'ai_assistant' && (
        <Sidebar activeTab={activeTab} user={user!} companyName={isGuest ? 'Demo Workspace' : company.name} onLogout={handleLogout} setActiveTab={setActiveTab} />
      )}
      <main className={`flex-1 overflow-y-auto no-scrollbar relative ${activeWorkflow || activeTab === 'ai_assistant' ? 'p-0' : 'pb-24 md:pb-12 pt-4'}`}>
        {!activeWorkflow && activeTab !== 'ai_assistant' && (
          <header className="sticky top-0 z-30 bg-candy-mint/80 backdrop-blur-md px-4 md:px-12 py-4 flex justify-between items-center no-print">
             <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight capitalize">{activeTab.replace('_', ' ')}</h2>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg transition-all relative border-2 ${activeTab === 'settings' ? 'bg-candy-petrol text-white border-candy-petrol shadow-lg' : 'bg-white text-slate-400 border-slate-50'}`}
                >
                   <span className="flat-icon">⚙️</span>
                </button>
                <button 
                  onClick={() => setActiveTab('alerts')}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg transition-all relative border-2 ${activeTab === 'alerts' ? 'bg-candy-petrol text-white border-candy-petrol shadow-lg' : 'bg-white text-slate-400 border-slate-50'}`}
                >
                   <span className="flat-icon">🔔</span>
                   {notifications.filter(n => !n.read).length > 0 && (
                     <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {notifications.filter(n => !n.read).length}
                     </span>
                   )}
                </button>
             </div>
          </header>
        )}

        <div className={`max-w-6xl mx-auto px-4 md:px-12 ${activeTab === 'ai_assistant' ? 'max-w-none px-0' : ''}`}>
          {activeTab === 'dashboard' && !activeWorkflow && <Dashboard workflows={workflows} history={history} user={user!} onCompare={setComparisonItems} onPrompt={startAIChat} />}
          {activeTab === 'workflows' && !editingWorkflow && !activeWorkflow && (
            <div className="space-y-12 pt-8">
               <div className="flex justify-end">
                  <button onClick={() => setEditingWorkflow({})} className="px-8 py-4 bg-candy-petrol text-white rounded-2xl font-black shadow-lg text-xs uppercase tracking-widest">{t('new_blueprint', lang)}</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {workflows.map(w => (
                    <div key={w.id} className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-50 group hover:shadow-heavy transition-all flex flex-col justify-between overflow-hidden relative">
                      <div>
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl flat-icon mb-6">🧩</div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{w.title}</h4>
                        <p className="text-slate-400 text-xs mt-3">"{w.description}"</p>
                      </div>
                      <button onClick={() => setActiveWorkflow(w)} className="w-full py-5 mt-10 bg-slate-50 text-slate-600 font-bold rounded-2xl group-hover:bg-candy-petrol group-hover:text-white transition-all text-sm uppercase tracking-widest">{t('launch_run', lang)}</button>
                    </div>
                  ))}
               </div>
            </div>
          )}
          {activeTab === 'tasks' && !activeWorkflow && <MyTasks user={user!} workflows={workflows} activeRuns={activeRuns} history={history} onResume={(r) => { setActiveWorkflow(workflows.find(w => w.id === r.workflowId) || null); setResumingRun(r); }} onLaunch={setActiveWorkflow} />}
          {activeTab === 'alerts' && !activeWorkflow && <NotificationInbox notifications={notifications} workflows={workflows} onMarkRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))} onClearAll={() => setNotifications([])} />}
          {activeTab === 'chat' && !activeWorkflow && <ChatHub user={user!} rooms={chatRooms} messages={chatMessages} groups={[]} workflows={workflows} allUsers={allUsers} onSendMessage={handleSendMessage} onOpenPrivateChat={handleOpenPrivateChat} />}
          {activeTab === 'settings' && !activeWorkflow && (
            <Settings 
              user={user!} company={company} groups={[]} allUsers={allUsers} masterTables={masterTables} connectors={connectors}
              onUpdateCompany={(name, mode) => setCompany({ ...company, name, syncMode: mode || 'auto' })} 
              onAddGroup={() => {}} onUpdateUserRole={() => {}} 
              onUpdateProfile={(upd) => setUser({...user, ...upd})} 
              onUpdateMasterTable={(updated) => setMasterTables(masterTables.map(t => t.id === updated.id ? updated : t))}
              onAddMasterTable={(newTable) => setMasterTables([...masterTables, newTable])}
              onDeleteMasterTable={(id) => setMasterTables(masterTables.filter(t => t.id !== id))}
              onLogout={handleLogout}
              isOnline={isOnline}
              history={history}
              workflows={workflows}
              activeRuns={activeRuns}
            />
          )}

          {activeTab === 'ai_assistant' && (
            <AIAssistant 
              user={user!}
              workflows={workflows}
              history={history}
              initialHistory={aiChatHistory}
              onClose={() => setActiveTab('dashboard')}
              onWorkflowCreated={setEditingWorkflow}
              onComparisonRequested={setComparisonItems}
              onTabRequested={setActiveTab}
              onFlowLaunchRequested={(id) => setActiveWorkflow(workflows.find(w => w.id === id) || null)}
            />
          )}
          
          {editingWorkflow && <WorkflowBuilder initialWorkflow={editingWorkflow} masterTables={masterTables} connectors={connectors} onSave={(w) => { setWorkflows([...workflows, w]); setEditingWorkflow(null); }} onCancel={() => setEditingWorkflow(null)} />}
          {activeWorkflow && <WorkflowInstanceView workflow={activeWorkflow} user={user} masterTables={masterTables} existingRun={resumingRun} onUpdateLifecycle={(run) => setActiveRuns([...activeRuns.filter(r => r.id !== run.id), run])} onComplete={handleAddInstance} onCancel={() => { setActiveWorkflow(null); setResumingRun(undefined); }} onOpenChat={() => {}} />}
          {comparisonItems && <ComparisonView workflow={workflows.find(w => w.id === comparisonItems[0].workflowId)!} instanceA={comparisonItems[0]} instanceB={comparisonItems[1]} onClose={() => setComparisonItems(null)} />}
        </div>
      </main>
      
      {!activeWorkflow && activeTab !== 'ai_assistant' && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lang={lang} 
        />
      )}
    </div>
  );
};

export default App;
