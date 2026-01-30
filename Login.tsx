
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User, isGuest?: boolean) => void;
  initialTenantName?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [tempUser, setTempUser] = useState<any>(null);
  const [flow, setFlow] = useState<'initial' | 'enterprise'>('initial');
  const [email, setEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const openDocs = () => {
    // Updated to FlowMe specific documentation
    window.open('https://flowme.ai/docs', '_blank');
  };

  const MOCK_GOOGLE_USER = {
    id: 'google_12345',
    name: 'Alex Operational',
    email: 'alex@flowme.ai',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: UserRole.MANAGER,
    companyId: "comp_farm_001",
  };

  const handleSimulatedGoogleLogin = async () => {
    setIsAuthenticating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTempUser(MOCK_GOOGLE_USER);
    setIsAuthenticating(false);
  };

  const handleGuestDemo = () => {
    const guestUser: User = {
      id: 'guest_demo',
      name: 'Guest Explorer',
      email: 'guest@flowme.demo',
      picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest',
      role: UserRole.WORKER,
      companyId: 'demo_co',
      preferredLanguage: 'en'
    };
    onLogin(guestUser, true);
  };

  const selectLanguage = (lang: 'en' | 'es' | 'pt-br') => {
    if (tempUser) {
      onLogin({ ...tempUser, preferredLanguage: lang });
    }
  };

  return (
    <div className="min-h-screen bg-candy-mint flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-candy-petrol rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-candy-aqua rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-heavy border border-slate-50 relative z-10 text-center animate-in zoom-in-95">
        {/* Help icon moved inside the card corner */}
        <button 
          onClick={openDocs}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform active:scale-95 text-slate-500 font-black border border-slate-100"
          title="App Documentation"
        >
          ?
        </button>

        {!tempUser ? (
          <div className="space-y-8 md:space-y-10">
            {/* Logo removed as requested */}
            
            <div className="space-y-2 pt-6">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">FlowMe</h1>
              {/* Mint flow line below name */}
              <div className="flex justify-center -mt-1">
                <svg width="120" height="8" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4C30 4 30 1 60 1C90 1 90 4 116 4" stroke="#B2F7EF" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="space-y-1 pt-4">
                <p className="font-bold uppercase text-[9px] tracking-[0.3em] text-slate-600">Operational Intelligence</p>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 italic">Organize. Act. Flow</p>
              </div>
            </div>

            {flow === 'initial' ? (
              <div className="space-y-4">
                <button 
                  onClick={handleSimulatedGoogleLogin}
                  disabled={isAuthenticating}
                  className="w-full py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  <span className="text-xl font-black text-blue-500">G</span>
                  {isAuthenticating ? 'Signing in...' : 'Sign in with Google'}
                </button>

                <button 
                  onClick={handleGuestDemo}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-xl"
                >
                  Try Guest Demo ✨
                </button>

                <div className="flex items-center gap-4 py-2">
                   <div className="flex-1 h-[1px] bg-slate-200"></div>
                   <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">or</span>
                   <div className="flex-1 h-[1px] bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setFlow('enterprise')}
                    className="py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-candy-petrol transition-colors border border-slate-100 shadow-sm"
                  >
                    Enterprise Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <input 
                  type="email" placeholder="name@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-2 focus:ring-candy-petrol/20"
                />
                <button onClick={() => alert("Enterprise resolution active in full product.")} className="w-full py-4 bg-candy-petrol text-white rounded-2xl font-bold shadow-lg">Identify Tenant →</button>
                <button onClick={() => setFlow('initial')} className="text-[11px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-900">Back</button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-4 border-candy-mint">
               <img src={tempUser.picture} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Welcome, {tempUser.name.split(' ')[0]}</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'en', label: 'English', flag: '🇺🇸' },
                { id: 'es', label: 'Español', flag: '🇪🇸' },
                { id: 'pt-br', label: 'Português', flag: '🇧🇷' }
              ].map(lang => (
                <button 
                  key={lang.id} onClick={() => selectLanguage(lang.id as any)}
                  className="flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl hover:bg-candy-mint hover:border-candy-petrol border border-transparent transition-all group"
                >
                  <span className="font-bold text-slate-700">{lang.label}</span>
                  <span className="text-xl md:text-2xl">{lang.flag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
