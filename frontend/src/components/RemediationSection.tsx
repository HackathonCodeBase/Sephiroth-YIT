'use client';

import { Sparkles, Info } from 'lucide-react';

interface RemediationSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
}

export default function RemediationSection({ results }: RemediationSectionProps) {
  const remedies = results?.intelligence?.ai_insights?.remedies || [];

  return (
    <div className="glass-white h-full shadow-xl bg-white border-orange-100 border-2 p-3 md:p-4 rounded-[32px] flex flex-col relative overflow-hidden backdrop-blur-xl group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] scale-[1.5] text-orange-600 pointer-events-none">
        <Sparkles className="w-16 h-16" />
      </div>
      
      <div className="relative z-10 mb-3">
        <div className="flex items-center w-full">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 whitespace-nowrap">── AI Recommendation </h4>
           <div className="h-[1px] w-full bg-gradient-to-r from-orange-500 to-transparent ml-3"></div>
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-3 px-1 overflow-y-auto custom-scrollbar">
        {remedies.length > 0 ? remedies.map((remedy: string, idx: number) => (
          <div key={idx} className="flex gap-3 items-start animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-50 text-orange-600 rounded-lg text-[11px] font-black border border-orange-100 shadow-sm">
              {idx + 1}
            </span>
            <p className="text-[15px] font-bold text-slate-700 leading-snug pt-0.5 tracking-tight group-hover:text-slate-900 transition-colors">
              {remedy}
            </p>
          </div>
        )) : (
          <div className="py-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
              Scanning for optimal remediation protocols...
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 pt-3 mt-3 border-t border-slate-100 space-y-3">
         <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">
              Est. Recovery Index: <span className="text-orange-600 ml-1 text-[13px] underline underline-offset-4 decoration-orange-200">{results?.intelligence?.ai_insights?.recovery || 'Quantifying...'}</span>
            </span>
         </div>
         
         <div className="space-y-1 p-3 bg-slate-50/50 rounded-[20px] border border-slate-100 shadow-inner group">
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" />
              Preventive Protocol
            </span>
            <p className="text-[12px] text-slate-500 font-bold leading-tight italic group-hover:text-slate-700 transition-colors">
              {results?.intelligence?.ai_insights?.preventive_note || 'Sensor fusion pending further observation.'}
            </p>
         </div>
      </div>
    </div>
  );
}
