
import React, { useState } from 'react';
import { User } from '../types';
import { t } from '../services/i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
  companyName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, companyName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lang = user.preferredLanguage || 'en';
  
  const menuItems = [
    { id: 'dashboard', label: t('home', lang), icon: '🏠' },
    { id: 'workflows', label: t('flows', lang), icon: '🔄' },
    { id: 'tasks', label: t('tasks', lang), icon: '🎯' },
    { id: 'chat', label: t('chat', lang), icon: '💬' },
  ];

  return (
    <div className={`hidden md:flex bg-white border-r border-slate-100 flex-col h-full shrink-0 shadow-sm transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-md hover:text-candy-petrol transition-all z-10"
      >
        <span className={`text-[10px] font-black transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          ◀
        </span>
      </button>

      {/* Profile/Identity Header */}
      <div className={`p-6 ${isCollapsed ? 'items-center' : ''} flex flex-col`}>
        <div className="flex items-center gap-3">
          <img 
            src={user.picture} 
            alt={user.name} 
            className="w-10 h-10 rounded-xl object-cover border-2 border-slate-50 shadow-sm shrink-0" 
          />
          {!isCollapsed && (
            <div className="overflow-hidden animate-in fade-in slide-in-from-left-2">
              <h1 className="text-sm font-black text-slate-800 tracking-tight whitespace-nowrap truncate">{user.displayName || user.name}</h1>
              <p className="text-[7px] text-slate-400 uppercase tracking-widest font-black truncate">{companyName}</p>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 px-3 space-y-1 pt-4 overflow-y-auto no-scrollbar ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center rounded-xl transition-all group ${
              activeTab === item.id ? 'bg-slate-50 text-candy-petrol active' : 'text-slate-400 hover:bg-slate-50/50'
            } ${isCollapsed ? 'justify-center h-12 px-0' : 'px-4 py-3 gap-4'}`}
          >
            <span className={`text-xl flat-icon ${isCollapsed ? 'm-0' : ''}`}>{item.icon}</span>
            {!isCollapsed && (
              <span className="font-bold text-[10px] uppercase tracking-wider whitespace-nowrap overflow-hidden animate-in fade-in">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t border-slate-50 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {!isCollapsed ? (
          <button 
            onClick={onLogout} 
            className="w-full text-[9px] font-black uppercase text-slate-400 hover:text-red-400 transition-colors text-left px-2"
          >
            {t('logout', lang)}
          </button>
        ) : (
          <button onClick={onLogout} title={t('logout', lang)} className="text-slate-300 hover:text-red-400 transition-colors">
            ⏻
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
