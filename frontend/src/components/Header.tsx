'use client';

import { Activity, Leaf, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  backendStatus: boolean;
}

export default function Header({ backendStatus }: HeaderProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-orange-100/50 px-6 py-4 transition-all duration-500 shadow-sm">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Branding Section */}
        <div className="flex items-center gap-4">
           <div className="p-2.5 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl shadow-lg ring-4 ring-orange-50/50 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
             <Leaf className="w-6 h-6 text-white" />
           </div>
           <div className="hidden sm:block">
             <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 text-slate-800 uppercase">
               Matrix Fusion <span className="text-orange-500">Sephiroth</span>
             </h1>
             <p className="text-[9px] text-orange-600/60 font-black uppercase tracking-[0.3em]">Neural Disease Intelligence</p>
           </div>
        </div>

        {/* Status Indicators Section */}
        <div className="flex items-center gap-4 lg:gap-8">
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100/50">
            <Zap className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Real-Time Core Active</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-emerald-600/80 uppercase tracking-tighter leading-none">Intelligence</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
                </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${backendStatus ? 'bg-orange-500 shadow-orange-300' : 'bg-rose-500 shadow-rose-300'} animate-pulse shadow-lg`}></div>
              <Activity className="w-4 h-4 text-slate-300 hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
