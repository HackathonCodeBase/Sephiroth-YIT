'use client';

import { useState } from 'react';
import { Dna, Navigation, Zap, Activity, Sparkles, Cpu, Bot, Globe } from 'lucide-react';

interface DiagnosticReportProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
  onEngineChange?: (engineId: string) => void;
}

export default function DiagnosticReport({ results, onEngineChange }: DiagnosticReportProps) {
  const [selectedLlm, setSelectedLlm] = useState('Gemini');
  
  // Match the active engine from metadata or results architecture
  const activeEngine = results?.metadata?.engine?.toLowerCase() || 
                       results?.architecture?.toLowerCase() || 
                       'mobilenet';

  const [selectedVision, setSelectedVision] = useState(
    activeEngine.includes('mobilenet') ? 'mobilenet' :
    activeEngine.includes('densenet') ? 'densenet' :
    activeEngine.includes('resnet') ? 'resnet' :
    activeEngine.includes('efficientnet') ? 'efficientnet' : 'mobilenet'
  );

  return (
    <div className="glass-white shadow-2xl bg-white border-orange-100 border-2 p-5 md:p-6 rounded-[40px] relative overflow-hidden backdrop-blur-2xl transition-all duration-500">
      {/* Decorative Background DNA */}
      <div className="absolute top-0 right-0 p-6 opacity-[0.05] scale-[2.5] pointer-events-none transition-transform duration-[2s] hover:rotate-12">
        <Dna className="w-20 h-20 text-orange-600" />
      </div>
      
      <div className="relative z-10 flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.6)]"></div>
              <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.25em]">Neural Pathology Core Output</span>
            </div>
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase text-slate-900 leading-none tracking-tighter drop-shadow-sm">
              {results?.analysis?.disease_detected || 
               (results?.crop && results?.disease ? `${results.crop} ${results.disease}` : null) || 
               'Pathology Syncing...'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="px-5 py-2.5 bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-[20px] font-black text-[13px] shadow-xl shadow-orange-500/20 uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform">
                <Sparkles className="w-4 h-4" />
                {Math.round((results?.analysis?.confidence || results?.confidence || 0) * 100)}% Match
             </div>
             <div className={`px-5 py-2.5 rounded-[20px] font-black text-[13px] uppercase tracking-widest border-2 transition-colors ${
               (results?.analysis?.severity || results?.severity || '').toLowerCase().includes('high') 
               ? 'bg-rose-50 border-rose-200 text-rose-600' 
               : 'bg-orange-50 border-orange-200 text-orange-600'
             }`}>
               {results?.analysis?.severity || results?.severity || 'Normal'}
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 bg-slate-50/50 rounded-[28px] border border-slate-100">
          <div className="flex items-center gap-4 p-4 bg-white rounded-[22px] border border-orange-50 shadow-sm hover:shadow-md transition-shadow group">
             <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Navigation className="w-5 h-5" />
             </div>
             <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Location Core</span>
                <span className="font-black text-sm text-slate-800 uppercase tracking-tight truncate block">
                  {results?.intelligence?.ai_insights?.location || 'Direct Sensor Latency'}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-[22px] border border-orange-50 shadow-sm hover:shadow-md transition-shadow group">
             <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <Zap className="w-5 h-5" />
             </div>
             <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Time Context</span>
                <span className="font-black text-sm text-slate-800 uppercase tracking-tight">{results?.intelligence?.ai_insights?.time_context || 'Standard Input'}</span>
             </div>
          </div>
        </div>

        {/* Neural Control Matrix (Selection) */}
        <div className="pt-4 border-t-2 border-slate-50 mt-2">
           <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
              
              {/* LLM Selection */}
              <div className="flex-1 space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-rose-50 rounded-lg">
                      <Bot className="w-3.5 h-3.5 text-rose-500" />
                   </div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Proprietary Matrix Processor</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {['Gemini 1.5 Pro', 'Groq LPU', 'GPT-4o'].map((model) => (
                      <button 
                        key={model}
                        onClick={() => setSelectedLlm(model)}
                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                          model === selectedLlm 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105 z-10' 
                          : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/30'
                        }`}
                      >
                         <Globe className="w-3 h-3" />
                         {model}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Vision Model Selection */}
              <div className="flex-1 space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-orange-50 rounded-lg">
                      <Cpu className="w-3.5 h-3.5 text-orange-500" />
                   </div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Vision Architecture Node</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {[
                      {id: 'mobilenet', name: 'MobileNet'},
                      {id: 'densenet', name: 'DenseNet'},
                      {id: 'resnet', name: 'ResNet'},
                      {id: 'efficientnet', name: 'EffNet-B4'}
                    ].map((engine) => (
                      <button 
                        key={engine.id}
                        onClick={() => {
                          setSelectedVision(engine.id);
                          onEngineChange?.(engine.id);
                        }}
                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                          selectedVision === engine.id
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-100 scale-105 z-10' 
                          : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/30'
                        }`}
                      >
                         <Activity className="w-3 h-3" />
                         {engine.name}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
