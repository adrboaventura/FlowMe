
import React, { useState, useRef } from 'react';
import { User, UserRole, Company, Group, MasterDataTable, IntegrationConnector, WorkflowInstance, Workflow } from '../types';
import { t } from '../services/i18n';
import MasterData from './MasterData';
import SyncQueue from './SyncQueue';
import HelpCenter from './HelpCenter';

interface SettingsProps {
  user: User;
  company: Company | null;
  groups: Group[];
  allUsers: User[];
  masterTables: MasterDataTable[];
  connectors: IntegrationConnector[];
  onUpdateCompany: (name: string, syncMode?: 'auto' | 'manual') => void;
  onUpdateUserRole: (userId: string, role: UserRole) => void;
  onAddGroup: (name: string) => void;
  onUpdateProfile: (updates: Partial<User>) => void;
  onUpdateMasterTable: (table: MasterDataTable) => void;
  onAddMasterTable: (table: MasterDataTable) => void;
  onDeleteMasterTable: (id: string) => void;
  onLogout: () => void;
  isOnline: boolean;
  history: WorkflowInstance[];
  workflows: Workflow[];
  activeRuns: any[];
}

type SettingView = 'menu' | 'profile' | 'org' | 'groups' | 'team' | 'perms' | 'master_data' | 'sync' | 'help';

const Settings: React.FC<SettingsProps> = ({ 
  user, company, groups, allUsers, masterTables, connectors,
  onUpdateCompany, onUpdateUserRole, onAddGroup, onUpdateProfile,
  onUpdateMasterTable, onAddMasterTable, onDeleteMasterTable, onLogout,
  isOnline, history, workflows, activeRuns
}) => {
  const [activeView, setActiveView] = useState<SettingView>('menu');
  const [newCompanyName, setNewCompanyName] = useState(company?.name || '');
  const [syncMode, setSyncMode] = useState<'auto' | 'manual'>(company?.syncMode || 'auto');
  const [displayName, setDisplayName] = useState(user.displayName || user.name);
  const lang = user.preferredLanguage || 'en';

  const menuOptions = [
    { id: 'profile', label: 'My Identity', sub: 'Photo, Display Name & Email', icon: '👤' },
    { id: 'sync', label: 'Offline Sync Hub', sub: 'Persistence & Local Queue', icon: '☁️' },
    { id: 'help', label: 'AI Help Center', sub: 'Guide & Operational Support', icon: '💡' },
    { id: 'master_data', label: t('master_data', lang), sub: 'Registry & CSV Import', icon: '📊' },
    { id: 'org', label: t('org_settings', lang), sub: 'Company Profile & Strategy', icon: '🏢' },
    { id: 'team', label: t('team_mgmt', lang), sub: 'Access & User Directory', icon: '👥' },
    { id: 'docs', label: 'System Documentation', sub: 'Full App Documentation', icon: '📖' },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'docs') {
      window.open('https://flowme.ai/docs', '_blank');
      return;
    }
    setActiveView(id as SettingView);
  };

  if (activeView === 'menu') {
    return (
      <div className="space-y-12 animate-in fade-in duration-500 pb-32 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleMenuClick(option.id)}
              className="group bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center justify-between hover:shadow-heavy hover:-translate-y-1 transition-all text-left"
            >
              <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-candy-mint rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:bg-candy-petrol group-hover:text-white transition-colors duration-500 shrink-0">{option.icon}</div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-800 text-base md:text-lg truncate">{option.label}</h4>
                  <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{option.sub}</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-candy-petrol text-lg transition-colors shrink-0">→</span>
            </button>
          ))}
          
          <button
            onClick={onLogout}
            className="group bg-red-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-red-100 flex items-center justify-between hover:bg-red-500 hover:shadow-heavy transition-all text-left md:col-span-2"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:bg-white/20 transition-colors">🚪</div>
              <div>
                <h4 className="font-black text-red-600 group-hover:text-white text-lg">{t('logout', lang)}</h4>
                <p className="text-[10px] text-red-400 group-hover:text-white/60 font-black uppercase tracking-widest">End Current Session</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-32 pt-4 md:pt-8">
      <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase tracking-widest mb-4 hover:text-slate-900 transition-colors">← Back to Settings</button>
      
      {activeView === 'profile' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-10">
               <div className="relative group">
                  <div className="w-48 h-48 rounded-[4rem] overflow-hidden border-8 border-candy-mint shadow-2xl relative">
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  </div>
               </div>
               <div className="w-full space-y-8">
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-8 py-6 bg-candy-mint rounded-3xl border-none text-2xl font-black shadow-inner" />
                  <button onClick={() => onUpdateProfile({ displayName })} className="w-full py-8 bg-candy-petrol text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-candy-petrol/20">Save Presence</button>
               </div>
            </div>
        </div>
      )}
      
      {activeView === 'master_data' && <MasterData tables={masterTables} connectors={connectors} onUpdateTable={onUpdateMasterTable} onAddTable={onAddMasterTable} onDeleteTable={onDeleteMasterTable} />}
      
      {activeView === 'sync' && <SyncQueue history={history} workflows={workflows} isOnline={isOnline} onSyncAll={() => {}} />}
      
      {activeView === 'help' && <HelpCenter user={user} systemState={{ activeRuns: activeRuns.length, synced: history.length }} />}
      
      {activeView === 'org' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-50 max-w-2xl mx-auto space-y-12">
           <h3 className="text-3xl font-black text-slate-800 tracking-tight">Organization Profile</h3>
           <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} className="w-full px-8 py-6 bg-candy-mint rounded-3xl border-none text-xl font-black shadow-inner" />
           <button onClick={() => onUpdateCompany(newCompanyName, syncMode)} className="w-full py-5 bg-candy-petrol text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Update Org</button>
        </div>
      )}
    </div>
  );
};

export default Settings;
