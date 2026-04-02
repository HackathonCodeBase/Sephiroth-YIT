'use client';

import { Camera, Cpu, Activity, ChevronRight, Plus } from 'lucide-react';
import React, { useState } from 'react';

interface AnalysisPanelProps {
  imagePreview: string | null;
  file: File | null;
  // For Temporal Mode
  imagePreview2?: string | null;
  file2?: File | null;
  isTemporalMode?: boolean;
  handleFile2Change?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Date Props
  date1?: string;
  setDate1?: (val: string) => void;
  date2?: string;
  setDate2?: (val: string) => void;

  analyzing: boolean;
  cropType: string;
  setCropType: (val: string) => void;
  visionEngine: string;
  setVisionEngine: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  blurError: string | null;
  checkingBlur?: boolean;
  llmProvider: string;
  setLlmProvider: (val: string) => void;
}

export default function AnalysisPanel({
  imagePreview,
  file,
  imagePreview2,
  file2,
  isTemporalMode,
  handleFile2Change,
  date1,
  setDate1,
  date2,
  setDate2,
  analyzing,
  cropType,
  setCropType,
  visionEngine,
  setVisionEngine,
  handleFileChange,
  handleUpload,
  blurError,
  checkingBlur,
  llmProvider,
  setLlmProvider,
}: AnalysisPanelProps) {
  const [isVisionDropdownOpen, setIsVisionDropdownOpen] = useState(false);
  const [isLlmDropdownOpen, setIsLlmDropdownOpen] = useState(false);

  return (
    <section className="glass-white rounded-[40px] p-8 md:p-10 relative border border-orange-100 shadow-xl shadow-orange-500/5">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center">
        
        {/* Upload & Preview Area */}
        <div className={`w-full ${isTemporalMode ? 'md:w-[60%]' : 'md:w-1/2'}`}>
            <div className={`flex gap-6 ${isTemporalMode ? 'flex-row items-start' : 'flex-col'}`}>
              
              {/* Slot 1: Baseline or Single */}
              <div className="flex-1 space-y-4">
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
                    <img src={imagePreview} className="w-full h-full object-cover rounded-[30px] animate-in fade-in zoom-in-95 duration-500" alt="Baseline" />
                  ) : (
                    <div className="text-center space-y-4 p-6 pointer-events-none">
                      <div className={`p-5 rounded-3xl mx-auto w-fit transition-transform group-hover:scale-110 ${blurError ? 'bg-rose-100' : 'bg-orange-50'}`}>
                        <Camera className={`w-10 h-10 ${blurError ? 'text-rose-500' : 'text-orange-500'}`} />
                      </div>
                      <div className="space-y-1">
                        <p className={`font-black text-xs uppercase tracking-tight ${blurError ? 'text-rose-600' : checkingBlur ? 'text-orange-600' : 'text-slate-800'}`}>
                          {isTemporalMode ? 'Day 0 Base' : checkingBlur ? 'Verifying...' : blurError ? 'Resolution Failure' : 'Initialize Scanner'}
                        </p>
                      </div>
                    </div>
                  )}

                  {checkingBlur && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 transition-all duration-300">
                      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {isTemporalMode && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 text-center">Baseline Date</p>
                    <input 
                      type="date" 
                      value={date1}
                      onChange={(e) => setDate1?.(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-[10px] font-bold text-slate-700 focus:border-orange-500/50 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Slot 2: Follow-up (Only in Temporal Mode) */}
              {isTemporalMode && (
                <div className="flex-1 space-y-4">
                  <div 
                    className={`relative w-full aspect-square rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
                      ${imagePreview2 ? 'border-orange-500/50' : 'border-slate-200 hover:border-orange-500/30 hover:bg-orange-50/20'}
                    `}
                  >
                    <input 
                      type="file" 
                      onChange={handleFile2Change} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
                      accept="image/*"
                      disabled={analyzing}
                    />
                    
                    {imagePreview2 ? (
                      <img src={imagePreview2} className="w-full h-full object-cover rounded-[30px] animate-in fade-in zoom-in-95 duration-500" alt="Latest" />
                    ) : (
                      <div className="text-center space-y-4 p-6 pointer-events-none">
                        <div className="p-5 rounded-3xl mx-auto w-fit bg-orange-50">
                          <Plus className="w-10 h-10 text-orange-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-xs uppercase tracking-tight text-slate-800">
                            Follow-up Scan
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 text-center">Follow-up Date</p>
                    <input 
                      type="date" 
                      value={date2}
                      onChange={(e) => setDate2?.(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-[10px] font-bold text-slate-700 focus:border-orange-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {analyzing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-in fade-in duration-300 rounded-[40px]">
                 <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-orange-600 font-black tracking-[0.2em] uppercase text-[10px]">Processing Matrix Neurons...</p>
              </div>
            )}
        </div>

        {/* Analysis Trigger & Stats */}
        <div className={`w-full ${isTemporalMode ? 'md:w-[40%]' : 'md:w-1/2'} space-y-6 lg:space-y-8`}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-600">
                <Cpu className="w-3 h-3" />
                Sephiroth Core Logic
              </div>
              <h2 className="text-3xl lg:text-4xl font-black leading-tight uppercase tracking-tighter text-slate-900">
                {isTemporalMode ? 'Temporal' : 'AgroCare'}<br /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-600">
                  {isTemporalMode ? 'Analysis' : 'Sephiroth'}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vision Engine Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Vision Engine</label>
                  <div className="relative">
                      <div 
                        onClick={() => !isTemporalMode && setIsVisionDropdownOpen(!isVisionDropdownOpen)}
                        className={`w-full bg-white border-2 border-slate-100 rounded-[24px] px-5 py-4 text-xs font-bold flex items-center justify-between transition-all shadow-sm ${isTemporalMode ? 'cursor-default' : 'hover:border-orange-500/30 cursor-pointer'}`}
                      >
                        <span className="text-slate-700 uppercase">
                          {[
                            {id: 'consolidated_core', name: 'Consolidated'},
                            {id: 'vit', name: 'Vision X (ViT)'},
                            {id: 'mobilenet', name: 'MobileNet'},
                            {id: 'densenet', name: 'DenseNet'},
                            {id: 'resnet', name: 'ResNet'},
                            {id: 'efficientnet', name: 'EfficientNet'}
                          ].filter(e => !isTemporalMode || e.id === 'consolidated_core')
                           .find(e => e.id === visionEngine)?.name || visionEngine}
                        </span>
                        {!isTemporalMode && <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isVisionDropdownOpen ? 'rotate-90 text-orange-500' : ''}`} />}
                      </div>
                      
                      {isVisionDropdownOpen && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border-2 border-orange-100 rounded-[24px] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                           {[
                            {id: 'consolidated_core', name: 'Consolidated Result'},
                            {id: 'vit', name: 'Vision Transformer'},
                            {id: 'mobilenet', name: 'MobileNet'},
                            {id: 'densenet', name: 'DenseNet'},
                            {id: 'resnet', name: 'ResNet'},
                            {id: 'efficientnet', name: 'EfficientNet'}
                          ].filter(e => !isTemporalMode || e.id === 'consolidated_core')
                           .map((engine) => (
                            <div 
                              key={engine.id}
                              onClick={() => {
                                setVisionEngine(engine.id);
                                setIsVisionDropdownOpen(false);
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

                {/* AI Advisor Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">AI Advisor</label>
                  <div className="relative">
                      <div 
                        onClick={() => !isTemporalMode && setIsLlmDropdownOpen(!isLlmDropdownOpen)}
                        className={`w-full bg-white border-2 border-slate-100 rounded-[24px] px-5 py-4 text-xs font-bold flex items-center justify-between transition-all shadow-sm ${isTemporalMode ? 'cursor-default' : 'hover:border-orange-500/30 cursor-pointer'}`}
                      >
                        <span className="text-slate-700 uppercase">
                          {[
                            {id: 'auto', name: 'Smart Auto'},
                            {id: 'groq', name: 'GROQ (Cloud)'},
                            {id: 'ollama', name: 'Ollama (Local)'}
                          ].filter(e => !isTemporalMode || e.id === 'groq')
                           .find(e => e.id === llmProvider)?.name || llmProvider}
                        </span>
                        {!isTemporalMode && <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isLlmDropdownOpen ? 'rotate-90 text-orange-500' : ''}`} />}
                      </div>
                      
                      {isLlmDropdownOpen && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border-2 border-orange-100 rounded-[24px] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                           {[
                            {id: 'auto', name: 'Smart Selection'},
                            {id: 'groq', name: 'GROQ Llama-3.1 (Fast)'},
                            {id: 'ollama', name: 'Ollama Llama-3.1 (Local)'}
                          ].filter(e => !isTemporalMode || e.id === 'groq')
                           .map((llm) => (
                            <div 
                              key={llm.id}
                              onClick={() => {
                                setLlmProvider(llm.id);
                                setIsLlmDropdownOpen(false);
                              }}
                              className={`px-5 py-4 text-xs font-bold cursor-pointer transition-colors ${
                                llmProvider === llm.id 
                                ? 'bg-orange-50 text-orange-600' 
                                : 'text-slate-700 hover:bg-slate-50 hover:text-orange-500'
                              }`}
                            >
                              {llm.name}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
            </div>

            {isTemporalMode && (
               <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Fusion Analytics Core</span>
                  <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest px-1">Consolidated Result Active</span>
               </div>
            )}
            
          <button 
            type="button"
            disabled={(isTemporalMode ? (!file || !file2) : !file) || analyzing}
            onClick={() => handleUpload()}
            className={`w-full py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all
              ${(isTemporalMode ? (file && file2) : file) && !analyzing ? 'bg-gradient-to-r from-orange-500 to-rose-600 hover:scale-[1.02] text-white shadow-xl shadow-orange-500/30 active:scale-[0.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Activity className="w-5 h-5" />
            {isTemporalMode ? 'Run Comparison' : 'Launch Matrix'}
          </button>
        </div>
      </div>
    </section>
  );
}
