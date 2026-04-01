'use client';

import { Camera, Cpu, Activity, ChevronRight, Check } from 'lucide-react';
import React, { useState } from 'react';

interface AnalysisPanelProps {
  imagePreview: string | null;
  file: File | null;
  analyzing: boolean;
  cropType: string;
  setCropType: (val: string) => void;
  visionEngine: string;
  setVisionEngine: (val: string) => void;
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
  visionEngine,
  setVisionEngine,
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

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Vision Engine</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border-2 border-slate-100 hover:border-orange-500/30 rounded-[24px] px-5 py-4 text-xs font-bold flex items-center justify-between transition-all shadow-sm cursor-pointer"
                  >
                    <span className="text-slate-700 uppercase">
                      {[
                        {id: 'mobilenet', name: 'MobileNet V2'},
                        {id: 'densenet', name: 'DenseNet-121'},
                        {id: 'resnet', name: 'ResNet-50'},
                        {id: 'efficientnet', name: 'EffNet-B4 (Beta)'}
                      ].find(e => e.id === visionEngine)?.name || visionEngine}
                    </span>
                    <Cpu className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border-2 border-orange-100 rounded-[24px] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {[
                        {id: 'mobilenet', name: 'MobileNet V2'},
                        {id: 'densenet', name: 'DenseNet-121'},
                        {id: 'resnet', name: 'ResNet-50'},
                        {id: 'efficientnet', name: 'EffNet-B4'}
                      ].map((engine) => (
                        <div 
                          key={engine.id}
                          onClick={() => {
                            setVisionEngine(engine.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-5 py-4 text-xs font-bold cursor-pointer transition-colors ${
                            visionEngine === engine.id 
                            ? 'bg-orange-50 text-orange-600' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-orange-500'
                          }`}
                        >
                          {engine.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
