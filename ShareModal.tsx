
import React, { useState } from 'react';
import { Workflow, SharedFlowLink } from '../types';

interface ShareModalProps {
  workflow: Workflow;
  onClose: () => void;
  onGenerate: (link: SharedFlowLink) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ workflow, onClose, onGenerate }) => {
  const [requireAuth, setRequireAuth] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const newLink: SharedFlowLink = {
      token,
      workflowId: workflow.id,
      ownerUserId: workflow.userId,
      requireAuth,
      createdAt: Date.now(),
      submissionCount: 0
    };
    
    onGenerate(newLink);
    
    const url = `${window.location.origin}${window.location.pathname}?fill=${token}`;
    setGeneratedLink(url);
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedLink || '')}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>FlowMe - ${workflow.title}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            .card { border: 10px solid #80b4ab; padding: 40px; border-radius: 40px; display: inline-block; }
            h1 { font-size: 48px; margin-bottom: 10px; }
            p { font-size: 24px; color: #666; margin-bottom: 30px; }
            img { width: 400px; height: 400px; }
            .brand { margin-top: 30px; font-weight: bold; color: #80b4ab; font-size: 20px; text-transform: uppercase; letter-spacing: 5px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">FlowMe Operations</div>
            <h1>SCAN TO START</h1>
            <p>${workflow.title}</p>
            <img src="${qrUrl}" />
            <div style="margin-top: 20px; font-size: 14px; opacity: 0.5;">Workflow ID: ${workflow.id}</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const qrImageUrl = generatedLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}&bgcolor=F5FFFA&color=80b4ab`
    : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl border border-white animate-in zoom-in-95 duration-300 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-candy-mint rounded-full opacity-40 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Mission Distribution</h2>
              <p className="text-[10px] text-candy-petrol font-black uppercase tracking-[0.4em] mt-1">Deploy to Physical Space</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 hover:text-red-400 flex items-center justify-center transition-all">✕</button>
          </div>

          {!generatedLink ? (
            <div className="space-y-8">
              <div className="bg-candy-mint p-6 rounded-[2rem] border border-candy-petrol/10">
                <p className="text-xs font-bold text-slate-600 mb-4">Security Protocol</p>
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setRequireAuth(false)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-4 transition-all text-left ${!requireAuth ? 'border-candy-petrol bg-white shadow-lg' : 'border-transparent bg-slate-50 opacity-60'}`}
                  >
                    <span className="text-2xl">🌍</span>
                    <div>
                      <p className="font-black text-slate-800 text-sm">Public (Scan & Go)</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Guest Workers • Physical Stations</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setRequireAuth(true)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-4 transition-all text-left ${requireAuth ? 'border-candy-petrol bg-white shadow-lg' : 'border-transparent bg-slate-50 opacity-60'}`}
                  >
                    <span className="text-2xl">🔐</span>
                    <div>
                      <p className="font-black text-slate-800 text-sm">Authenticated Only</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Internal Teams • High Privacy</p>
                    </div>
                  </button>
                </div>
              </div>
              <button 
                onClick={generateLink}
                className="w-full py-6 bg-candy-petrol text-white rounded-[2rem] font-black text-xl shadow-xl shadow-candy-petrol/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <span>Generate Mission Link</span>
                <span className="text-2xl">🔗</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row gap-8 items-center bg-candy-mint p-8 rounded-[2.5rem] border-4 border-dashed border-candy-petrol/20">
                {qrImageUrl && (
                  <div className="bg-white p-4 rounded-3xl shadow-xl border border-white">
                    <img src={qrImageUrl} alt="QR Code" className="w-40 h-40" />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <p className="text-[10px] font-black text-candy-petrol uppercase tracking-[0.3em]">Execution QR Ready</p>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">Place this QR code at the physical site of work for instant access.</p>
                  <div className="flex gap-2">
                    <button onClick={handlePrintQR} className="flex-1 py-3 bg-candy-petrol text-white rounded-xl font-black text-[10px] uppercase tracking-widest">🖨️ Print</button>
                    <a href={qrImageUrl!} download={`flowme-${workflow.id}.png`} className="flex-1 py-3 bg-white text-candy-petrol border border-candy-petrol/20 rounded-xl font-black text-[10px] uppercase tracking-widest text-center">💾 Save</a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                 <input readOnly value={generatedLink} className="flex-1 bg-transparent text-[10px] font-bold text-slate-400 outline-none truncate" />
                 <button onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }} className="text-candy-petrol font-black text-[10px] uppercase">Copy Link</button>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-candy-petrol transition-colors"
              >
                Finished Deployment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
