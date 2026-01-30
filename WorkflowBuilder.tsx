
import React, { useState } from 'react';
import { Workflow, FieldType, WorkflowField, LayoutMode, MasterDataTable, VisibilityType, IntegrationConnector, FieldMapping, ValidationRules, ConditionalRule } from '../types';

interface WorkflowBuilderProps {
  initialWorkflow?: Partial<Workflow>;
  masterTables: MasterDataTable[];
  connectors: IntegrationConnector[];
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ initialWorkflow, masterTables, connectors, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'build' | 'logic' | 'tasks'>('build');
  const [title, setTitle] = useState(initialWorkflow?.title || '');
  const [description, setDescription] = useState(initialWorkflow?.description || '');
  const [layout, setLayout] = useState<LayoutMode>(initialWorkflow?.layout || LayoutMode.SINGLE_FORM);
  const [fields, setFields] = useState<WorkflowField[]>(initialWorkflow?.fields || []);
  const [visibility, setVisibility] = useState<VisibilityType>(initialWorkflow?.visibilityType || VisibilityType.PERSONAL);
  const [enableReview, setEnableReview] = useState(initialWorkflow?.enableReviewBeforeSubmit || false);
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  
  // Task Flow State
  const [isTaskFlow, setIsTaskFlow] = useState(initialWorkflow?.isTaskFlow || false);
  const [taskReminders, setTaskReminders] = useState(initialWorkflow?.taskReminderEnabled || false);
  const [reminderInterval, setReminderInterval] = useState(initialWorkflow?.reminderIntervalMinutes || 30);
  const [deadlineTime, setDeadlineTime] = useState(initialWorkflow?.reminderDeadlineTime || '');

  const [integrationEnabled, setIntegrationEnabled] = useState(initialWorkflow?.integrationConfig?.enabled || false);
  const [selectedConnectorId, setSelectedConnectorId] = useState(initialWorkflow?.integrationConfig?.connectorId || '');
  const [endpointPath, setEndpointPath] = useState(initialWorkflow?.integrationConfig?.endpointPath || '/submit');
  const [mappings, setMappings] = useState<FieldMapping[]>(initialWorkflow?.integrationConfig?.mappings || []);

  const addField = () => {
    const newField: WorkflowField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Question/Step',
      type: FieldType.TEXT,
      required: false,
      validation: {
        required: false,
        readOnly: false
      },
      options: []
    };
    setFields([...fields, newField]);
    setExpandedFieldId(newField.id);
  };

  const updateFieldValidation = (fieldId: string, updates: Partial<ValidationRules>) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, validation: { ...(f.validation || { required: false, readOnly: false }), ...updates } };
      }
      return f;
    }));
  };

  const updateConditionalRule = (fieldId: string, rule: Partial<ConditionalRule> | null) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { 
          ...f, 
          validation: { 
            ...(f.validation || { required: false, readOnly: false }), 
            conditionalRequired: rule ? { ...(f.validation?.conditionalRequired || { dependsOnFieldId: '', operator: '==', value: '' }), ...rule } : undefined 
          } 
        };
      }
      return f;
    }));
  };

  const handleSave = () => {
    if (!title) return alert('Workflow needs a title!');
    onSave({
      id: initialWorkflow?.id || Math.random().toString(36).substr(2, 9),
      title, description,
      category: initialWorkflow?.category || 'General',
      layout, fields,
      createdAt: Date.now(),
      userId: "", 
      visibilityType: visibility,
      sharedGroupIds: [],
      notificationsEnabled: false,
      notificationIntervalMinutes: 15,
      notifyGroup: false,
      notifySpecificUserIds: [],
      integrationConfig: {
        enabled: integrationEnabled,
        connectorId: selectedConnectorId,
        endpointPath,
        mappings
      },
      enableReviewBeforeSubmit: enableReview,
      isTaskFlow,
      taskReminderEnabled: taskReminders,
      reminderIntervalMinutes: reminderInterval,
      reminderDeadlineTime: deadlineTime
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-white/70 p-6 rounded-[2.5rem] backdrop-blur-md sticky top-0 z-20 border border-white shadow-xl shadow-candy-petrol/5">
        <div className="flex gap-8 items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Architect Mode</h2>
            <p className="text-[10px] text-candy-petrol font-black uppercase tracking-widest">Blueprint Designer</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setActiveTab('build')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'build' ? 'bg-candy-petrol text-white' : 'text-slate-600'}`}>Structure</button>
             <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'tasks' ? 'bg-candy-petrol text-white' : 'text-slate-600'}`}>Protocol</button>
             <button onClick={() => setActiveTab('logic')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'logic' ? 'bg-candy-petrol text-white' : 'text-slate-600'}`}>Advanced</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-3 border rounded-2xl font-bold text-slate-600 text-xs uppercase">Discard</button>
          <button onClick={handleSave} className="px-8 py-3 bg-candy-petrol text-white rounded-2xl shadow-lg font-black text-xs uppercase">Save Blueprint</button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        {activeTab === 'build' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Title</label>
                   <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-8 py-5 bg-candy-mint rounded-3xl border-none focus:ring-4 focus:ring-candy-petrol/10 text-2xl font-black placeholder:opacity-30" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Form Style</label>
                    <div className="flex gap-2">
                       <button onClick={() => setLayout(LayoutMode.SINGLE_FORM)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border-4 transition-all ${layout === LayoutMode.SINGLE_FORM ? 'border-candy-petrol bg-white text-candy-petrol' : 'border-transparent bg-slate-50 text-slate-400'}`}>Single Page Form</button>
                       <button onClick={() => setLayout(LayoutMode.PAGINATED)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border-4 transition-all ${layout === LayoutMode.PAGINATED ? 'border-candy-petrol bg-white text-candy-petrol' : 'border-transparent bg-slate-50 text-slate-400'}`}>Multi-Step Survey</button>
                    </div>
                 </div>
               </div>
               <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Organization Visibility</label>
                    <div className="grid grid-cols-1 gap-4">
                       <button onClick={() => setVisibility(VisibilityType.PERSONAL)} className={`p-5 rounded-2xl border-4 transition-all text-left ${visibility === VisibilityType.PERSONAL ? 'border-candy-petrol bg-white' : 'border-transparent bg-transparent opacity-60'}`}>
                          <p className="font-black text-slate-800 text-sm">Personal Library</p>
                       </button>
                       <button onClick={() => setVisibility(VisibilityType.GROUP_SHARED)} className={`p-5 rounded-2xl border-4 transition-all text-left ${visibility === VisibilityType.GROUP_SHARED ? 'border-candy-petrol bg-white' : 'border-transparent bg-transparent opacity-60'}`}>
                          <p className="font-black text-slate-800 text-sm">Organization Workspace</p>
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-50">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-700">Field Sequencer</h3>
                  <button onClick={addField} className="bg-candy-petrol text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2">＋ Add Field</button>
               </div>
               <div className="space-y-4">
                 {fields.map((field, idx) => {
                   const isExpanded = expandedFieldId === field.id;
                   return (
                    <div key={field.id} className={`bg-slate-50/50 p-8 rounded-[2.5rem] border-2 transition-all ${isExpanded ? 'border-candy-petrol shadow-xl bg-white' : 'border-transparent'}`}>
                      <div className="flex gap-8 items-center cursor-pointer" onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}>
                        <div className="bg-candy-petrol text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">{idx + 1}</div>
                        <div className="flex-1">
                           <p className="font-black text-slate-800 text-xl">{field.label || 'Untitled Field'}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{field.type} {field.validation?.required ? '• REQUIRED' : ''}</p>
                        </div>
                        <span className={`text-slate-300 text-xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </div>

                      {isExpanded && (
                        <div className="mt-8 pt-8 border-t border-slate-100 space-y-8 animate-in slide-in-from-top-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Label</label>
                              <input type="text" value={field.label} onChange={(e) => setFields(fields.map(f => f.id === field.id ? {...f, label: e.target.value} : f))} className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold border-none outline-none" />
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Type</label>
                              <select value={field.type} onChange={(e) => setFields(fields.map(f => f.id === field.id ? {...f, type: e.target.value as any} : f))} className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold border-none outline-none">
                                {Object.values(FieldType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* VALIDATION RULES ENGINE UI */}
                          <div className="bg-candy-mint/30 p-8 rounded-[2.5rem] border-2 border-white space-y-8">
                            <h4 className="text-[10px] font-black text-candy-petrol uppercase tracking-[0.3em]">Validation Rules Engine</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <label className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 cursor-pointer">
                                  <input type="checkbox" checked={field.validation?.required} onChange={(e) => updateFieldValidation(field.id, { required: e.target.checked })} className="w-5 h-5 accent-candy-petrol" />
                                  <span className="font-black text-xs uppercase text-slate-600">Always Required</span>
                               </label>
                               <label className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 cursor-pointer">
                                  <input type="checkbox" checked={field.validation?.readOnly} onChange={(e) => updateFieldValidation(field.id, { readOnly: e.target.checked })} className="w-5 h-5 accent-candy-petrol" />
                                  <span className="font-black text-xs uppercase text-slate-600">Read Only</span>
                               </label>
                            </div>

                            {field.type === FieldType.NUMBER && (
                              <div className="grid grid-cols-2 gap-6 pt-4 animate-in fade-in">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Minimum Value</label>
                                    <input type="number" value={field.validation?.min ?? ''} onChange={(e) => updateFieldValidation(field.id, { min: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white px-6 py-3 rounded-xl border border-slate-100 font-bold" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Maximum Value</label>
                                    <input type="number" value={field.validation?.max ?? ''} onChange={(e) => updateFieldValidation(field.id, { max: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white px-6 py-3 rounded-xl border border-slate-100 font-bold" />
                                 </div>
                              </div>
                            )}

                            {/* CONDITIONAL REQUIRED UI */}
                            <div className="pt-6 border-t border-white/50 space-y-4">
                               <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conditional Requirement</p>
                                  <button 
                                    onClick={() => updateConditionalRule(field.id, field.validation?.conditionalRequired ? null : {})}
                                    className="text-[9px] font-black text-candy-petrol uppercase underline"
                                  >
                                    {field.validation?.conditionalRequired ? 'Remove Rule' : 'Add Conditional Rule'}
                                  </button>
                               </div>

                               {field.validation?.conditionalRequired && (
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/50 p-6 rounded-3xl border border-white animate-in zoom-in-95">
                                    <select 
                                      value={field.validation.conditionalRequired.dependsOnFieldId}
                                      onChange={(e) => updateConditionalRule(field.id, { dependsOnFieldId: e.target.value })}
                                      className="bg-white px-4 py-3 rounded-xl font-bold text-xs"
                                    >
                                       <option value="">Depends on Field...</option>
                                       {fields.filter(f => f.id !== field.id).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                    <select 
                                      value={field.validation.conditionalRequired.operator}
                                      onChange={(e) => updateConditionalRule(field.id, { operator: e.target.value as any })}
                                      className="bg-white px-4 py-3 rounded-xl font-bold text-xs text-center"
                                    >
                                       <option value="==">Equals (==)</option>
                                       <option value="!=">Not Equals (!=)</option>
                                       <option value=">">Greater Than (&gt;)</option>
                                       <option value="<">Less Than (&lt;)</option>
                                       <option value="contains">Contains</option>
                                    </select>
                                    <input 
                                      type="text" 
                                      placeholder="Value..."
                                      value={field.validation.conditionalRequired.value ?? ''}
                                      onChange={(e) => updateConditionalRule(field.id, { value: e.target.value })}
                                      className="bg-white px-4 py-3 rounded-xl font-bold text-xs"
                                    />
                                 </div>
                               )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-4 pt-4">
                            <button onClick={() => setFields(fields.filter(f => f.id !== field.id))} className="text-red-500 font-black text-[10px] uppercase tracking-widest">Delete Field</button>
                            <button onClick={() => setExpandedFieldId(null)} className="text-candy-petrol font-black text-[10px] uppercase tracking-widest">Collapse</button>
                          </div>
                        </div>
                      )}
                   </div>
                 )})}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-12 animate-in slide-in-from-right-12 duration-500">
             <div className="flex items-center justify-between bg-candy-mint p-10 rounded-[3.5rem] border-4 border-white shadow-inner">
                <div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">Mission Critical Task</h3>
                   <p className="text-slate-500 font-medium mt-1">Mark this workflow as a priority task with autonomous tracking.</p>
                </div>
                <button 
                  onClick={() => setIsTaskFlow(!isTaskFlow)}
                  className={`w-20 h-10 rounded-full transition-all relative p-1 ${isTaskFlow ? 'bg-candy-petrol' : 'bg-slate-200'}`}
                >
                   <div className={`w-8 h-8 rounded-full bg-white shadow-md transition-all ${isTaskFlow ? 'ml-10' : 'ml-0'}`} />
                </button>
             </div>
          </div>
        )}
        
        {activeTab === 'logic' && (
          <div className="space-y-12 animate-in slide-in-from-right-4">
             <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between">
               <div>
                  <p className="font-black text-slate-800 text-xs">Final Quality Audit (Review Screen)</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Force verification of all validation rules before conclusion.</p>
               </div>
               <button 
                  onClick={() => setEnableReview(!enableReview)}
                  className={`w-14 h-8 rounded-full transition-all relative p-1 ${enableReview ? 'bg-candy-petrol' : 'bg-slate-200'}`}
               >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${enableReview ? 'ml-6' : 'ml-0'}`} />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
