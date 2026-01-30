
import React, { useState } from 'react';
import { MasterDataTable, MasterDataColumn, MasterDataColumnType } from '../types';

interface CSVWizardProps {
  onComplete: (tableName: string, columns: MasterDataColumn[], rows: any[], targetTableId?: string) => void;
  onCancel: () => void;
  existingTables: MasterDataTable[];
}

const CSVWizard: React.FC<CSVWizardProps> = ({ onComplete, onCancel, existingTables }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [tableName, setTableName] = useState('');
  const [targetTableId, setTargetTableId] = useState<string>('new');
  const [mappings, setMappings] = useState<Record<string, string>>({}); // CSV Header -> FlowMe Field

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setTableName(file.name.replace('.csv', '').replace(/_/g, ' '));

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const dataRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
      });

      setRawHeaders(headers);
      setRawData(dataRows);
      
      // Default mappings
      const initialMappings: Record<string, string> = {};
      headers.forEach(h => initialMappings[h] = h.toLowerCase().replace(/\s+/g, '_'));
      setMappings(initialMappings);
      
      setStep(2);
    };
    reader.readAsText(file);
  };

  const handleFinish = () => {
    const columns: MasterDataColumn[] = (Object.entries(mappings) as [string, string][]).map(([csvHeader, flowKey]) => ({
      id: flowKey,
      name: csvHeader,
      type: MasterDataColumnType.STRING
    }));

    const rows = rawData.map(r => {
      const transformed: any = {};
      (Object.entries(mappings) as [string, string][]).forEach(([csvHeader, flowKey]) => {
        transformed[flowKey] = r[csvHeader];
      });
      return transformed;
    });

    onComplete(tableName, columns, rows, targetTableId === 'new' ? undefined : targetTableId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl z-[110] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh] rounded-t-[4rem] md:rounded-[4rem] shadow-2xl border border-white overflow-hidden animate-in slide-in-from-bottom-20 duration-500 flex flex-col">
        
        {/* Progress Header */}
        <div className="p-8 md:p-10 bg-candy-mint/40 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-slate-100">📂</div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">CSV Import Wizard</h2>
              <p className="text-[10px] text-candy-petrol font-black uppercase tracking-[0.4em] mt-1">Excel Connection Engine</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-4 text-slate-300 hover:text-red-400 font-black">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
          {step === 1 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-12 animate-in zoom-in-95">
               <label className="w-full max-w-lg p-24 border-8 border-dashed border-slate-100 rounded-[5rem] hover:bg-candy-mint hover:border-candy-petrol/20 cursor-pointer transition-all group flex flex-col items-center active:scale-95">
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  <span className="text-9xl mb-8 group-hover:scale-110 transition-transform">📄</span>
                  <span className="text-2xl font-black text-slate-700">Tap to Select CSV</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 opacity-60">XLSX Exported CSV Only</span>
               </label>
               <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-slate-400 font-bold text-sm italic">"Import whole registries like Barns or Item Catalogs instantly."</p>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-12">
               <h3 className="text-xs font-black text-candy-petrol uppercase tracking-[0.4em] mb-4">Choose Target Destination</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setTargetTableId('new')}
                    className={`p-10 rounded-[3.5rem] border-4 text-left transition-all flex flex-col justify-between h-72 active:scale-95 ${targetTableId === 'new' ? 'border-candy-petrol bg-white shadow-xl' : 'border-slate-50 bg-slate-50/50 opacity-60'}`}
                  >
                     <span className="text-5xl">🆕</span>
                     <div>
                       <p className="text-2xl font-black text-slate-800">Create New Entity</p>
                       <p className="text-xs font-bold text-slate-400 mt-2">Initialize a fresh library from CSV structure.</p>
                     </div>
                  </button>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">Or Append to Existing</p>
                    <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                      {existingTables.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => setTargetTableId(t.id)}
                          className={`w-full p-6 rounded-3xl border-4 text-left transition-all active:scale-95 ${targetTableId === t.id ? 'border-candy-petrol bg-white shadow-md' : 'border-slate-50 bg-white'}`}
                        >
                           <p className="font-black text-slate-700 text-sm">{t.name}</p>
                           <p className="text-[8px] text-slate-300 font-bold uppercase">{t.rows.length} Records</p>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
               
               <div className="pt-8 border-t border-slate-50 flex flex-col gap-4">
                  <input 
                    type="text" value={tableName} onChange={(e) => setTableName(e.target.value)}
                    placeholder="Provide a name for this dataset..."
                    className="w-full px-8 py-5 bg-candy-mint rounded-3xl border-none outline-none text-xl font-black text-slate-800 shadow-inner"
                  />
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full py-8 bg-candy-petrol text-white rounded-[2.5rem] font-black text-2xl shadow-xl shadow-candy-petrol/20 active:scale-95"
                  >
                    Next: Map Columns →
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-12">
              <div>
                <h3 className="text-xs font-black text-candy-petrol uppercase tracking-[0.4em] mb-4">Schema Alignment</h3>
                <p className="text-slate-400 font-medium text-sm">Point CSV headers to their corresponding FlowMe internal keys.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {rawHeaders.map(header => (
                  <div key={header} className="bg-slate-50 p-8 rounded-[3rem] border-2 border-white flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                       <span className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100">📑</span>
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">CSV Data Column</p>
                          <p className="text-xl font-black text-slate-700">{header}</p>
                       </div>
                    </div>
                    <div className="relative">
                       <span className="absolute -top-3 left-6 bg-slate-50 px-2 text-[8px] font-black text-candy-petrol uppercase tracking-widest z-10">Map to FlowMe Key</span>
                       <input 
                        value={mappings[header]}
                        onChange={(e) => setMappings({...mappings, [header]: e.target.value})}
                        className="w-full bg-white px-8 py-5 rounded-2xl border-2 border-slate-100 outline-none font-black text-slate-600 focus:border-candy-petrol transition-all"
                       />
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-6 -mx-8 md:-mx-12 mt-12 border-t border-slate-50 flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase text-xs tracking-widest">Back</button>
                <button onClick={() => setStep(4)} className="flex-[2] py-6 bg-candy-petrol text-white rounded-3xl font-black text-xl shadow-lg active:scale-95">Verify Import</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="h-full flex flex-col space-y-12 animate-in zoom-in-95">
              <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-candy-aqua/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                 <h3 className="text-xs font-black text-candy-aqua uppercase tracking-[0.4em] mb-10">Verification Analytics</h3>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Data Rows</p>
                       <p className="text-6xl font-black">{rawData.length}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Field Count</p>
                       <p className="text-6xl font-black">{rawHeaders.length}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-candy-mint/50 p-10 rounded-[3rem] border-4 border-dashed border-candy-petrol/20 text-center">
                 <p className="text-slate-500 font-bold italic text-lg leading-relaxed">
                   "You are about to commit <strong>{rawData.length}</strong> records to the <strong>{tableName}</strong> entity. This data will be synchronized across all mission devices."
                 </p>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                 <button 
                  onClick={handleFinish}
                  className="w-full py-10 bg-candy-petrol text-white rounded-[3rem] font-black text-4xl shadow-2xl shadow-candy-petrol/40 active:scale-95 transition-all"
                 >
                  INGEST DATA 🚀
                 </button>
                 <button onClick={() => setStep(3)} className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] py-4">Revisit Mappings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVWizard;
