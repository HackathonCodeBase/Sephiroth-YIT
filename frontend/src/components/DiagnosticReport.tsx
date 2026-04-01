'use client';

import { Dna, Navigation, Zap } from 'lucide-react';

interface DiagnosticReportProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
}

export default function DiagnosticReport({ results }: DiagnosticReportProps) {
  return (
    <div className="glass-white shadow-2xl bg-white/80 border-orange-100 border-2 p-6 md:p-8 rounded-[40px] space-y-6 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[3]">
        <Dna className="w-20 h-20 text-orange-600" />
      </div>
      
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center bg-orange-50/50 p-4 rounded-3xl border border-orange-100">
           <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Sephiroth Diagnostic Data</span>
           <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-200">
              {Math.round(results.analysis.confidence * 100)}% Matrix Match
           </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-1">Host Cultivar</span>
            <p className="font-black text-xl text-slate-800 leading-none uppercase tracking-tighter">{results.intelligence.crop_type || 'Tomato'}</p>
          </div>
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Infection Level</span>
            <p className="font-black text-xl text-rose-600 leading-none uppercase tracking-tighter">{results.analysis.severity}</p>
          </div>
          <div className="space-y-2 col-span-2 pt-4 border-t border-orange-100">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">Neural Pathology Result</span>
            <h3 className="text-3xl md:text-3xl font-black uppercase text-slate-900 leading-tight tracking-tight drop-shadow-sm">
              {results.analysis.disease_detected}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-3 p-3 bg-orange-50/30 rounded-2xl border border-orange-100">
             <div className="p-2 bg-white rounded-xl shadow-sm text-orange-500">
                <Navigation className="w-4 h-4" />
             </div>
             <span className="font-black text-[10px] text-slate-600 uppercase tracking-tight truncate">
               {results.intelligence.ai_insights.location}
             </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-rose-50/30 rounded-2xl border border-rose-100">
             <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500">
                <Zap className="w-4 h-4" />
             </div>
             <span className="font-black text-[10px] text-slate-600 uppercase tracking-tight truncate">
               {results.intelligence.ai_insights.time_context}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
