'use client';

import { Sparkles, Info } from 'lucide-react';

interface RemediationSectionProps {
  results: any;
}

export default function RemediationSection({ results }: RemediationSectionProps) {
  return (
    <div className="glass-white bg-indigo-600 shadow-2xl p-6 md:p-8 rounded-[40px] space-y-6 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-8 opacity-20 scale-[2.5] text-white">
        <Sparkles className="w-20 h-20" />
      </div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
           <div className="h-[2px] flex-grow bg-white/20"></div>
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 shrink-0">REMEDIATION STRATEGY</h4>
           <div className="h-[2px] flex-grow bg-white/20"></div>
        </div>
        
        <div className="space-y-3.5">
          {results.intelligence.ai_insights.remedies.map((remedy: string, idx: number) => (
            <div key={idx} className="flex gap-4 text-xs md:text-sm text-white items-start p-3.5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md group hover:bg-white/20 transition-all cursor-default">
              <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-lg text-[10px] font-black text-indigo-100 shrink-0 mt-0.5">{idx + 1}</span>
              <span className="font-bold leading-relaxed">{remedy}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 pt-8 mt-4 border-t border-white/20 space-y-4">
         <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Clinical Prognosis</span>
            <span className="text-xs font-black text-white bg-white/20 px-3 py-1 rounded-full uppercase tracking-tighter">
              {results.intelligence.ai_insights.recovery}
            </span>
         </div>
         <div className="p-4 bg-white/10 rounded-3xl border border-white/10 flex gap-4 backdrop-blur-md">
            <div className="p-2 bg-indigo-400 rounded-2xl shadow-inner">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1">
               <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.1em] block">Preventive Protocol</span>
               <p className="text-[11px] text-white font-bold leading-relaxed opacity-90">
                 {results.intelligence.ai_insights.preventive_note}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
