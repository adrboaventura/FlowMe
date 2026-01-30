
import React, { useState } from 'react';
import { IntegrationConnector } from '../types';

interface IntegrationHubProps {
  connectors: IntegrationConnector[];
  onAddConnector: (connector: IntegrationConnector) => void;
  onDeleteConnector: (id: string) => void;
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({ connectors, onAddConnector, onDeleteConnector }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<IntegrationConnector>>({
    authType: 'apiKey',
    headersJson: '{}'
  });

  const handleSave = () => {
    if (!formData.name || !formData.baseUrl) return alert("Required: Connector Name and Base URL");
    onAddConnector({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      baseUrl: formData.baseUrl,
      authType: formData.authType as any,
      authValue: formData.authValue || '',
      headersJson: formData.headersJson || '{}',
      createdAt: Date.now()
    });
    setFormData({ authType: 'apiKey', headersJson: '{}' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter">Integration Hub</h2>
          <p className="text-candy-petrol font-black uppercase text-[10px] tracking-[0.4em] mt-3">Enterprise API Connectors</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-10 py-5 bg-candy-petrol text-white rounded-3xl font-black shadow-xl shadow-candy-petrol/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <span>New Connector</span>
          <span className="text-2xl">🔌</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-4 border-candy-petrol/10 animate-in zoom-in-95">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">System Name</label>
                  <input 
                    type="text" placeholder="e.g. Farm ERP / SAP Business One"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Base API URL</label>
                  <input 
                    type="text" placeholder="https://api.yourcompany.com/v1"
                    value={formData.baseUrl || ''}
                    onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Authentication</label>
                  <div className="flex gap-4">
                    <select 
                      value={formData.authType}
                      onChange={(e) => setFormData({...formData, authType: e.target.value as any})}
                      className="bg-slate-50 px-6 py-4 rounded-2xl font-bold text-xs outline-none"
                    >
                      <option value="apiKey">API Key (X-API-Key)</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="none">No Auth</option>
                    </select>
                    <input 
                      type="password" placeholder="Key Value..."
                      value={formData.authValue || ''}
                      onChange={(e) => setFormData({...formData, authValue: e.target.value})}
                      className="flex-1 px-8 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Custom Headers (JSON)</label>
                  <textarea 
                    placeholder='{"X-Tenant-ID": "north_creek"}'
                    value={formData.headersJson}
                    onChange={(e) => setFormData({...formData, headersJson: e.target.value})}
                    className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold min-h-[100px]"
                  />
                </div>
              </div>
           </div>
           <div className="mt-12 flex justify-end gap-4">
              <button onClick={() => setShowAdd(false)} className="px-10 py-4 font-black text-slate-300 uppercase text-xs tracking-widest">Cancel</button>
              <button onClick={handleSave} className="px-12 py-5 bg-candy-petrol text-white rounded-2xl font-black shadow-lg shadow-candy-petrol/20">Establish Connection</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {connectors.map(conn => (
          <div key={conn.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all min-h-[300px]">
             <div>
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-candy-mint text-candy-petrol rounded-2xl flex items-center justify-center text-2xl">🔌</div>
                   <button onClick={() => onDeleteConnector(conn.id)} className="text-slate-200 hover:text-red-400 p-2">🗑️</button>
                </div>
                <h3 className="text-2xl font-black text-slate-800">{conn.name}</h3>
                <p className="text-slate-400 text-[10px] font-bold mt-2 truncate">{conn.baseUrl}</p>
             </div>
             <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-candy-petrol uppercase tracking-widest bg-candy-mint px-4 py-1 rounded-full">Active Endpoint</span>
                <span className="text-[9px] text-slate-300 font-bold">Created {new Date(conn.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
        ))}

        {connectors.length === 0 && !showAdd && (
          <div className="col-span-full py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center text-center">
             <span className="text-6xl opacity-10 mb-6">📡</span>
             <h3 className="text-2xl font-black text-slate-300 tracking-tight">Zero External Systems Linked</h3>
             <p className="text-slate-300 font-bold italic mt-2 opacity-60">Connect FlowMe to your ERP or SQL database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationHub;
