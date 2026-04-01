'use client';

import { Leaf, Navigation, Wind } from 'lucide-react';

interface HeaderProps {
  droneStatus: any;
  backendStatus: boolean;
}

export default function Header({ droneStatus, backendStatus }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-6 glass-white p-6 rounded-[32px] border border-white/40 shadow-sm">
      <div className="flex items-center gap-4 w-full md:w-auto">
         <div className="p-3.5 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-2xl shadow-lg">
           <Leaf className="w-7 h-7 text-white" />
         </div>
         <div>
           <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
             Crop-Sense
           </h1>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phytology Analytics Neural-Cloud</p>
         </div>
      </div>

      <div className="flex gap-4 items-center">
        {droneStatus ? (
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Drone Uplink</span>
              <span className="text-xs font-bold text-green-600">Connected ({droneStatus.altitude})</span>
            </div>
            <Navigation className="w-5 h-5 text-green-600 animate-pulse" />
          </div>
        ) : (
            <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100">
              <span className="text-xs font-bold text-rose-600">Drone Offline</span>
              <Wind className="w-5 h-5 text-rose-600" />
            </div>
        )}
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-green-500' : 'bg-rose-500'} animate-pulse`}></div>
          <span className="text-xs font-bold uppercase text-slate-400">System Ready</span>
        </div>
      </div>
    </header>
  );
}
