'use client';

import { Activity, Cpu, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';

interface DiagnosticReportProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
  onEngineChange?: (engineId: string) => void;
}

export default function DiagnosticReport({ results, onEngineChange }: DiagnosticReportProps) {
  if (!results) return null;

  // Match the active engine from metadata or results architecture
  const activeEngine = results?.metadata?.engine?.toLowerCase() || 
                       results?.architecture?.toLowerCase() || 
                       'consolidated_core';

  const selectedVision = 
    activeEngine.includes('consolidated') || activeEngine.includes('expert') || activeEngine.includes('fusion') || activeEngine.includes('agrocare') ? 'consolidated_core' :
    activeEngine.includes('mobilenet') ? 'mobilenet' :
    activeEngine.includes('densenet') ? 'densenet' :
    activeEngine.includes('resnet') ? 'resnet' :
    activeEngine.includes('efficientnet') ? 'efficientnet' : 'consolidated_core';

  return (
    <div className="glass-white shadow-2xl bg-white/90 border-orange-100 border-2 p-8 md:p-10 rounded-[40px] space-y-8 relative overflow-hidden backdrop-blur-3xl animate-in fade-in duration-700">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] scale-[4]">
        <ShieldCheck className="w-24 h-24 text-orange-600" />
      </div>
      
      <div className="space-y-8 relative z-10">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-3 bg-orange-50/80 px-5 py-2.5 rounded-2xl border border-orange-100/50">
             <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
             <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">Sephiroth Neural Pathology MVD</span>
           </div>
           <div className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 tracking-tighter">
              {results.confidence ? Math.round(results.confidence * 100) : 0}% Matrix Match
           </div>
        </div>

        {/* Primary Diagnosis */}
        <div className="space-y-4 text-center py-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] px-1 mb-2">Neural Identification Result</span>
            <h3 className="text-4xl md:text-5xl font-black uppercase text-slate-900 leading-[0.95] tracking-tighter drop-shadow-sm">
              {results.disease || 'UNIDENTIFIED'}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Host Cultivar</span>
              <p className="font-black text-xl text-slate-800 uppercase tracking-tight">{results.crop || 'AUTO'}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Infection Density</span>
              <p className="font-black text-xl text-rose-600 uppercase tracking-tight">{results.severity || 'MODERATE'}</p>
            </div>
          </div>
        </div>

        {/* Vision Architecture Selectors (Model Switchers) */}
        <div className="space-y-4 pt-4 border-t border-orange-100/50">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vision Architectures</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Execution</span>
              </div>
           </div>
           <div className="flex flex-wrap gap-2">
              {[
                {id: 'consolidated_core', name: 'Consolidated Result'},
                {id: 'mobilenet', name: 'MobileNet'},
                {id: 'densenet', name: 'DenseNet'},
                {id: 'resnet', name: 'ResNet'},
                {id: 'efficientnet', name: 'EfficientNet'}
              ].map((engine) => (
                <button 
                  key={engine.id}
                  onClick={() => onEngineChange?.(engine.id)}
                  className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all border-2 
                    ${selectedVision === engine.id 
                      ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200 hover:text-orange-500'}`}
                >
                  {engine.name}
                </button>
              ))}
           </div>
        </div>

        {/* Insight Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
           <div className="flex items-center gap-4 p-4 bg-orange-50/50 rounded-[28px] border border-orange-100/50 group transition-all hover:bg-orange-50 hover:-translate-y-1">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500 transition-transform group-hover:rotate-12">
                 <Cpu className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[9px] text-orange-400 uppercase tracking-[0.2em] mb-1">Processing Engine</span>
                <span className="font-black text-xs text-slate-700 uppercase tracking-tight">
                  {results.metadata?.engine || results.architecture || 'Matrix Fallback'}
                </span>
              </div>
           </div>
           <div className="flex items-center gap-4 p-4 bg-rose-50/50 rounded-[28px] border border-rose-100/50 group transition-all hover:bg-rose-50 hover:-translate-y-1">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500 transition-transform group-hover:rotate-12">
                 <Zap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[9px] text-rose-400 uppercase tracking-[0.2em] mb-1">Inference Context</span>
                <span className="font-black text-xs text-slate-700 uppercase tracking-tight">
                  {results.intelligence?.ai_insights?.time_context || 'Optimum Window'}
                </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
