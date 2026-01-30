
import React, { useState } from 'react';
import { MasterDataTable, MasterDataColumn, MasterDataColumnType, IntegrationConnector, FieldMapping } from '../types';
import CSVWizard from './CSVWizard';

interface MasterDataProps {
  tables: MasterDataTable[];
  connectors: IntegrationConnector[];
  onUpdateTable: (table: MasterDataTable) => void;
  onAddTable: (table: MasterDataTable) => void;
  onDeleteTable: (id: string) => void;
}

const MasterData: React.FC<MasterDataProps> = ({ tables, connectors, onUpdateTable, onAddTable, onDeleteTable }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCSVWizard, setShowCSVWizard] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const createTable = () => {
    if (!newTableName) return;
    const newTable: MasterDataTable = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTableName,
      columns: [
        { id: 'col_code', name: 'Code', type: MasterDataColumnType.STRING },
        { id: 'col_name', name: 'Name', type: MasterDataColumnType.STRING },
        { id: 'col_active', name: 'Active', type: MasterDataColumnType.BOOLEAN },
      ],
      rows: [],
      userId: ''
    };
    onAddTable(newTable);
    setNewTableName('');
    setShowCreateForm(false);
    setSelectedTableId(newTable.id);
  };

  const exportToCSV = (table: MasterDataTable) => {
    const headers = table.columns.map(c => c.name).join(',');
    const rows = table.rows.map(row => 
      table.columns.map(col => `"${row[col.id] || ''}"`).join(',')
    ).join('\n');
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${table.name.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImportComplete = (name: string, columns: MasterDataColumn[], rows: any[], targetId?: string) => {
    if (targetId) {
      const existing = tables.find(t => t.id === targetId);
      if (existing) {
        onUpdateTable({
          ...existing,
          rows: [...existing.rows, ...rows]
        });
        setSelectedTableId(existing.id);
      }
    } else {
      const newTable: MasterDataTable = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        columns,
        rows,
        userId: ''
      };
      onAddTable(newTable);
      setSelectedTableId(newTable.id);
    }
    setShowCSVWizard(false);
  };

  const handleApiImport = async () => {
    if (!selectedTable?.externalSource?.connectorId) return alert("Configure an external source first!");
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockRows = [
      { col_code: 'B-001', col_name: 'Barn North A', col_active: true },
      { col_code: 'B-002', col_name: 'Barn North B', col_active: true },
      { col_code: 'B-003', col_name: 'Barn South C', col_active: false }
    ];
    onUpdateTable({ ...selectedTable, rows: [...selectedTable.rows, ...mockRows] });
    setIsImporting(false);
  };

  const updateSourceConfig = (connectorId: string, endpointPath: string) => {
    if (!selectedTable) return;
    onUpdateTable({
      ...selectedTable,
      externalSource: {
        connectorId,
        endpointPath,
        mappings: []
      }
    });
  };

  if (selectedTable) {
    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => setSelectedTableId(null)} className="group flex items-center gap-3 text-slate-700 p-2 hover:text-slate-900 transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xs">←</div>
            <span className="font-black uppercase text-[10px] md:text-[11px] tracking-widest">Library</span>
          </button>
          
          <div className="flex gap-2 md:gap-4 ml-auto">
             <button 
              onClick={() => exportToCSV(selectedTable)}
              className="px-4 md:px-8 py-3 md:py-4 bg-white text-slate-600 rounded-2xl md:rounded-3xl border-2 border-slate-100 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
             >
               Export
             </button>
             <button onClick={() => onUpdateTable({...selectedTable, rows: [{}, ...selectedTable.rows]})} className="px-4 md:px-8 py-3 md:py-4 bg-candy-petrol text-white rounded-2xl md:rounded-3xl shadow-xl font-black text-[9px] md:text-[10px] uppercase active:scale-95">New Record</button>
          </div>
        </div>

        <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-6 md:gap-8 overflow-hidden">
              <div className="w-full overflow-hidden">
                <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter break-words line-clamp-2">{selectedTable.name}</h2>
                <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.4em] mt-2">Data Registry Management</p>
              </div>
              <div className="p-6 md:p-8 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 w-full md:w-auto shrink-0">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Enterprise Source Binding</p>
                 <div className="flex gap-2">
                    <select 
                      value={selectedTable.externalSource?.connectorId || ''}
                      onChange={(e) => updateSourceConfig(e.target.value, selectedTable.externalSource?.endpointPath || '/')}
                      className="bg-white border border-slate-200 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold outline-none flex-1 min-w-0"
                    >
                       <option value="">Manual Entry</option>
                       {connectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {selectedTable.externalSource && (
                       <button 
                        onClick={handleApiImport}
                        disabled={isImporting}
                        className="bg-slate-900 text-white px-4 md:px-6 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase disabled:opacity-30 whitespace-nowrap"
                       >
                         {isImporting ? '...' : 'Sync'}
                       </button>
                    )}
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto no-scrollbar -mx-6 md:mx-0 pb-4">
             <table className="w-full text-left border-separate border-spacing-y-4 px-6 md:px-0 min-w-[500px]">
               <thead>
                 <tr className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                   {selectedTable.columns.map(col => <th key={col.id} className="px-6 py-2">{col.name}</th>)}
                   <th className="w-12"></th>
                 </tr>
               </thead>
               <tbody>
                 {selectedTable.rows.map((row, idx) => (
                   <tr key={idx} className="group">
                     {selectedTable.columns.map(col => (
                       <td key={col.id} className="px-2">
                          <input 
                            className="w-full bg-slate-50 px-4 md:px-6 py-4 md:py-5 rounded-2xl border-2 border-transparent focus:border-candy-petrol outline-none font-bold text-slate-700 text-sm min-w-[120px]"
                            value={row[col.id] ?? ''}
                            onChange={(e) => {
                               const updated = [...selectedTable.rows];
                               updated[idx] = { ...updated[idx], [col.id]: e.target.value };
                               onUpdateTable({ ...selectedTable, rows: updated });
                            }}
                          />
                       </td>
                     ))}
                     <td className="px-4 text-right">
                       <button onClick={() => {
                          const updated = selectedTable.rows.filter((_, i) => i !== idx);
                          onUpdateTable({ ...selectedTable, rows: updated });
                       }} className="text-slate-200 hover:text-red-400 p-2 transition-colors">🗑️</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-32 pt-4 md:pt-8 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 overflow-hidden">
        <div className="w-full overflow-hidden">
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter break-words">Business Library</h2>
          <p className="text-candy-petrol font-black uppercase text-[9px] md:text-[10px] tracking-[0.4em] mt-3">Managed Enterprise Entities</p>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto shrink-0">
          <button 
            onClick={() => setShowCSVWizard(true)} 
            className="flex-1 md:flex-none px-6 md:px-10 py-4 md:py-6 bg-white text-candy-petrol border-4 border-candy-petrol/10 rounded-[1.8rem] md:rounded-[2.5rem] font-black hover:bg-candy-mint transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 whitespace-nowrap"
          >
            <span className="text-xl">📂</span>
            <span className="text-[10px] md:text-sm uppercase tracking-widest">Import CSV</span>
          </button>
          <button onClick={() => setShowCreateForm(true)} className="flex-1 md:flex-none px-6 md:px-10 py-4 md:py-6 bg-candy-petrol text-white rounded-[1.8rem] md:rounded-[2.5rem] font-black hover:scale-105 transition-all text-[10px] md:text-sm uppercase tracking-widest shadow-xl shadow-candy-petrol/20 active:scale-95 whitespace-nowrap">New Type</button>
        </div>
      </div>

      {showCSVWizard && (
        <CSVWizard 
          existingTables={tables} 
          onCancel={() => setShowCSVWizard(false)} 
          onComplete={handleCSVImportComplete} 
        />
      )}

      {showCreateForm && (
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl animate-in zoom-in-95 border-4 border-candy-petrol/5">
          <input 
            type="text" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} 
            placeholder="Entity Name (e.g. Products, Locations)" 
            className="w-full px-6 md:px-10 py-5 md:py-8 bg-candy-mint rounded-[1.5rem] md:rounded-[2.5rem] border-none outline-none text-lg md:text-2xl font-black shadow-inner"
          />
          <div className="mt-8 flex gap-4">
            <button onClick={createTable} className="flex-1 py-4 md:py-6 bg-candy-petrol text-white rounded-2xl md:rounded-3xl font-black text-base md:text-xl active:scale-95 shadow-lg">Initialize Entity</button>
            <button onClick={() => setShowCreateForm(false)} className="px-6 md:px-10 py-4 md:py-6 bg-slate-50 text-slate-500 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[9px] md:text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {tables.map(table => (
          <div key={table.id} onClick={() => setSelectedTableId(table.id)} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[350px] md:min-h-[400px] active:scale-[0.98] overflow-hidden">
            <div className="max-w-full">
               <div className="flex justify-between items-start mb-8 md:mb-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-candy-mint text-candy-petrol rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shadow-inner group-hover:bg-candy-petrol group-hover:text-white transition-colors duration-500 shrink-0">📂</div>
                  <div className="text-right shrink-0">
                     <span className="text-3xl md:text-4xl font-black text-candy-petrol">{table.rows.length}</span>
                     <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Records</p>
                  </div>
               </div>
               <h4 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight break-words line-clamp-2">{table.name}</h4>
               {table.externalSource && (
                 <div className="flex items-center gap-2 mt-4">
                   <span className="w-2 h-2 bg-candy-petrol rounded-full animate-pulse"></span>
                   <p className="text-[9px] text-candy-petrol font-black uppercase tracking-widest">API Bound 📡</p>
                 </div>
               )}
            </div>
            <div className="pt-6 md:pt-8 border-t border-slate-50 flex justify-between items-center mt-8 md:mt-12 shrink-0">
               <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-candy-petrol transition-colors">Manage Data →</span>
               <button onClick={(e) => { e.stopPropagation(); onDeleteTable(table.id); }} className="text-slate-100 hover:text-red-400 p-2 transition-colors">🗑️</button>
            </div>
          </div>
        ))}

        {tables.length === 0 && !showCreateForm && (
           <div className="col-span-full py-32 md:py-40 bg-white rounded-[3rem] md:rounded-[5rem] border-8 border-dashed border-slate-50 flex flex-col items-center justify-center text-center px-6">
             <span className="text-7xl md:text-9xl opacity-10 mb-8 grayscale">📊</span>
             <h3 className="text-2xl md:text-3xl font-black text-slate-300 tracking-tight">Library Empty</h3>
             <p className="text-slate-400 font-bold italic mt-2 opacity-60 text-sm md:text-base">"Import data or create types to start managing enterprise registries."</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default MasterData;
