
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Workflow, WorkflowInstance, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';

interface AIAssistantProps {
  user: any;
  workflows: Workflow[];
  history: WorkflowInstance[];
  initialHistory?: ChatMessage[];
  onClose: () => void;
  onWorkflowCreated: (workflow: Partial<Workflow>) => void;
  onComparisonRequested: (instances: WorkflowInstance[]) => void;
  onTabRequested: (tabId: string) => void;
  onFlowLaunchRequested: (flowId: string) => void;
}

// --- AUDIO UTILS ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  user, workflows, history, initialHistory = [], onClose,
  onWorkflowCreated, onComparisonRequested, onTabRequested, onFlowLaunchRequested 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Native Audio Refs
  const sessionRef = useRef<any>(null);
  const audioCtxRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const controlTools: FunctionDeclaration[] = [
    {
      name: 'navigate_to_tab',
      parameters: {
        type: Type.OBJECT,
        description: 'Navigate to a specific screen in the application.',
        properties: {
          tabId: { 
            type: Type.STRING, 
            description: 'The ID of the tab to switch to.',
            enum: ['dashboard', 'workflows', 'tasks', 'chat', 'sync', 'help', 'settings']
          }
        },
        required: ['tabId']
      }
    },
    {
      name: 'launch_workflow',
      parameters: {
        type: Type.OBJECT,
        description: 'Launch or open a specific workflow/form for data entry.',
        properties: {
          workflowTitle: { type: Type.STRING, description: 'The title of the workflow to open.' }
        },
        required: ['workflowTitle']
      }
    },
    {
      name: 'create_new_workflow',
      parameters: {
        type: Type.OBJECT,
        description: 'Generate a new business workflow based on a prompt.',
        properties: {
          prompt: { type: Type.STRING, description: 'Description of the workflow needed.' }
        },
        required: ['prompt']
      }
    }
  ];

  const cleanupAudio = () => {
    setIsListening(false);
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.input.close(); audioCtxRef.current.output.close(); audioCtxRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
  };

  const handleToolCall = async (fc: any) => {
    if (fc.name === 'navigate_to_tab') {
      onTabRequested(fc.args.tabId as string);
      return "Navigated to " + fc.args.tabId;
    }
    if (fc.name === 'launch_workflow') {
      const target = workflows.find(w => w.title.toLowerCase().includes((fc.args.workflowTitle as string).toLowerCase()));
      if (target) {
        onFlowLaunchRequested(target.id);
        return "Launched " + target.title;
      }
      return "Workflow not found.";
    }
    if (fc.name === 'create_new_workflow') {
      const draft = await geminiService.generateWorkflow(fc.args.prompt as string);
      onWorkflowCreated(draft);
      return "Workflow blueprint generated and opened for review.";
    }
    return "Action completed.";
  };

  const initVoiceSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.outputTranscription) {
            const text = msg.serverContent.outputTranscription.text;
            addMessage('ai', text);
          }
          const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio && audioCtxRef.current) {
            const ctx = audioCtxRef.current.output;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          }
          if (msg.toolCall) {
            for (const fc of msg.toolCall.functionCalls) {
              const res = await handleToolCall(fc);
              sessionPromise.then(s => s.sendToolResponse({
                functionResponses: [{ id: fc.id, name: fc.name, response: { result: res } }]
              }));
            }
          }
        },
        onclose: () => cleanupAudio(),
        onerror: () => cleanupAudio()
      },
      config: {
        responseModalities: [Modality.AUDIO],
        tools: [{ functionDeclarations: controlTools }],
        outputAudioTranscription: {},
        systemInstruction: "You are the FlowMe AI Assistant. Use tools to help the user manage workflows. Be concise and operational."
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const handleToggleVoice = async () => {
    if (isListening) { cleanupAudio(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = {
        input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
        output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
      };
      await initVoiceSession();
      setIsListening(true);
      const source = audioCtxRef.current.input.createMediaStreamSource(stream);
      const script = audioCtxRef.current.input.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = script;
      script.onaudioprocess = (e) => {
        if (!isListening || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
        sessionRef.current.sendRealtimeInput({
          media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
        });
      };
      source.connect(script);
      script.connect(audioCtxRef.current.input.destination);
    } catch (err) { alert("Mic access denied."); }
  };

  const addMessage = (role: 'user' | 'ai', text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      roomId: 'ai_assistant',
      senderId: role === 'user' ? user.id : 'ai',
      senderName: role === 'user' ? user.name : 'FlowMe AI',
      senderPicture: role === 'user' ? user.picture : '✨',
      text,
      timestamp: Date.now(),
      type: 'text'
    }]);
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    addMessage('user', text);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: text,
        config: {
          systemInstruction: "You are the FlowMe AI Assistant. Help the user with operational workflows. If they want to create or launch something, acknowledge the task. Use reasoning.",
          tools: [{ functionDeclarations: controlTools }],
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });

      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          const resText = await handleToolCall(fc);
          addMessage('ai', resText);
        }
      } else {
        addMessage('ai', response.text || "I'm not sure how to help with that.");
      }
    } catch (err) {
      addMessage('ai', "I encountered an error connecting to my neural core.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-screen bg-candy-mint flex flex-col animate-in fade-in duration-500">
      {/* AI Header */}
      <header className="px-8 py-6 bg-white/80 backdrop-blur-md border-b border-slate-50 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-lg">✨</div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">FlowMe Assistant</h2>
            <p className="text-[9px] text-candy-petrol font-black uppercase tracking-widest">Historical Intelligence Thread</p>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">✕</button>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 no-scrollbar max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner">💡</div>
            <h3 className="text-2xl font-black text-slate-400 italic">Operational Genesis</h3>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Ask me to create flows, launch tasks, or analyze data.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
              <div className={`flex gap-4 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${isMe ? 'border-candy-petrol' : 'border-slate-100 bg-white'}`}>
                  {isMe ? <img src={msg.senderPicture} className="w-full h-full rounded-lg object-cover" /> : '✨'}
                </div>
                <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">{msg.senderName}</p>
                  <div className={`p-6 rounded-[2rem] font-medium text-base shadow-sm leading-relaxed ${
                    isMe ? 'bg-candy-petrol text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isThinking && (
          <div className="flex justify-start animate-in fade-in">
             <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center">✨</div>
                <div className="p-6 rounded-[2rem] rounded-tl-none bg-white border border-slate-100 flex gap-2">
                   <div className="w-1.5 h-1.5 bg-candy-petrol rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-candy-petrol rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-candy-petrol rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Dock */}
      <div className="p-6 md:p-10 bg-white border-t border-slate-50 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
           <button 
            onClick={handleToggleVoice}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-candy-mint'}`}
           >
             {isListening ? '⏹️' : '🎙️'}
           </button>
           <div className="flex-1 bg-slate-50 p-2 rounded-[2.5rem] border border-slate-100 flex items-center gap-2 group focus-within:ring-4 focus-within:ring-candy-petrol/5 transition-all">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Send a directive..."
                className="flex-1 bg-transparent px-6 py-4 font-bold text-slate-700 outline-none"
              />
              <button 
                onClick={handleSendText}
                className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg hover:bg-black transition-all shadow-lg active:scale-90"
              >
                →
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
