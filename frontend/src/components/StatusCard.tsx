'use client';

import { Activity, Cpu, ShieldCheck } from 'lucide-react';

interface StatusCardProps {
  loading: boolean;
  data: { status: string; message?: string } | null;
}

export default function StatusCard({ loading, data }: StatusCardProps) {
  return (
    <div className="glass p-8 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-24 h-24 text-indigo-400" />
      </div>
      <div className="relative">
        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Cpu className="w-6 h-6 text-indigo-400" />
          </div>
          Backend Status
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400">Connection status</span>
            {loading ? (
              <span className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                 <span className="text-indigo-400 font-medium">Checking...</span>
              </span>
            ) : data ? (
              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
                <span className="text-green-400 font-bold uppercase tracking-wider">{data.status}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20"></div>
                <span className="text-rose-500 font-bold uppercase tracking-wider">Disconnected</span>
              </span>
            )}
          </div>
          {!loading && !data && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              Ensure FastAPI is running on port 8000.
            </div>
          )}
          {!loading && data && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              Backend is communicating with the frontend flawlessly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
