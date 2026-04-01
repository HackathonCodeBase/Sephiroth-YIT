'use client';

import { Camera, Cpu, Activity, ChevronRight, Check } from 'lucide-react';
import React, { useState } from 'react';

interface AnalysisPanelProps {
  imagePreview: string | null;
  file: File | null;
  analyzing: boolean;
  cropType: string;
  setCropType: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  blurError: string | null;
  checkingBlur?: boolean;
}

export default function AnalysisPanel({
  imagePreview,
  file,
  analyzing,
  cropType,
  setCropType,
  handleFileChange,
  handleUpload,
  blurError,
  checkingBlur
}: AnalysisPanelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <section className="glass-white rounded-[40px] p-8 md:p-10 relative border border-orange-100 shadow-xl shadow-orange-500/5">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center">
        
        {/* Upload & Preview Area */}
        <div className="w-full md:w-1/2">
           <div 
            className={`relative w-full aspect-square rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${imagePreview ? 'border-orange-500/50' : blurError ? 'border-rose-500/50 bg-rose-50/10' : checkingBlur ? 'border-orange-400/50 bg-orange-50/5' : 'border-slate-200 hover:border-orange-500/30 hover:bg-orange-50/20'}
            `}
           >
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
              accept="image/*"
              disabled={analyzing || checkingBlur}
            />
            
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover rounded-[30px] animate-in fade-in zoom-in-95 duration-500" alt="Leaf sample" />
            ) : (
              <div className="text-center space-y-4 p-6 pointer-events-none">
                <div className={`p-5 rounded-3xl mx-auto w-fit transition-transform group-hover:scale-110 ${blurError ? 'bg-rose-100' : 'bg-orange-50'}`}>
                  <Camera className={`w-10 h-10 ${blurError ? 'text-rose-500' : 'text-orange-500'}`} />
                </div>
                <div className="space-y-1">
                  <p className={`font-black text-lg uppercase tracking-tight ${blurError ? 'text-rose-600' : checkingBlur ? 'text-orange-600' : 'text-slate-800'}`}>
                    {checkingBlur ? 'Verifying...' : blurError ? 'Resolution Failure' : 'Initialize Scanner'}
                  </p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Drone Imagery or Mobile Optical Feed
                  </p>
                </div>
              </div>
            )}

            {checkingBlur && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 transition-all duration-300">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {analyzing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
                 <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-orange-600 font-black tracking-[0.2em] uppercase text-[10px]">Processing Matrix Neurons...</p>
              </div>
            )}
           </div>
        </div>

        {/* Analysis Trigger & Stats */}
        <div className="w-full md:w-1/2 space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-600">
                <Cpu className="w-3 h-3" />
                Sephiroth Core Logic
              </div>
              <h2 className="text-4xl md:text-3xl lg:text-4xl font-black leading-tight uppercase tracking-tighter text-slate-900">
                Pathology <br /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-600">
                  Matrix Analysis
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Active Cultivar</label>
              <div className="relative group">
                <div className="w-full bg-white border-2 border-slate-100 group-hover:border-orange-500/30 rounded-[32px] px-6 py-5 text-sm font-bold flex items-center justify-between transition-all shadow-sm">
                  <span className="text-slate-700">{cropType}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                
                <select 
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 appearance-none bg-transparent"
                >
                  {['Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Rice', 'Wheat'].map((crop) => (
                    <option key={crop} value={crop} className="text-slate-900">{crop}</option>
                  ))}
                </select>
              </div>
            </div>
            
          <button 
            type="button"
            disabled={!file || analyzing}
            onClick={handleUpload}
            className={`w-full py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all
              ${file && !analyzing ? 'bg-gradient-to-r from-orange-500 to-rose-600 hover:scale-[1.02] text-white shadow-xl shadow-orange-500/30 active:scale-[0.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Activity className="w-5 h-5" />
            Launch Matrix Intelligence
          </button>
        </div>
      </div>
    </section>
  );
}
