
import React from 'react';
import { t } from '../services/i18n';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, lang = 'en' }) => {
  const menuItems = [
    { id: 'dashboard', label: t('home', lang), icon: '🏠' },
    { id: 'workflows', label: t('flows', lang), icon: '🔄' },
    { id: 'tasks', label: t('tasks', lang), icon: '🎯' },
    { id: 'chat', label: t('chat', lang), icon: '💬' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-4 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
              isActive ? 'text-candy-petrol scale-110' : 'text-slate-400 opacity-60'
            }`}
          >
            <span className={`text-xl transition-all ${isActive ? '' : 'grayscale'}`}>
              {item.icon}
            </span>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
