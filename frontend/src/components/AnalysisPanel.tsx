'use client';

import { Camera, Cpu, Activity, ChevronRight, Check } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisPanelProps {
  imagePreview: string | null;
  file: File | null;
  analyzing: boolean;
  cropType: string;
  setCropType: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
}

export default function AnalysisPanel({
  imagePreview,
  file,
  analyzing,
  cropType,
  setCropType,
  handleFileChange,
  handleUpload
}: AnalysisPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
       // We create a fake event structure because handleFileChange expects it
       const fakeEvent = {
         target: { files: [droppedFile] }
       } as unknown as React.ChangeEvent<HTMLInputElement>;
       handleFileChange(fakeEvent);
    }
  };

  return (
    <section className="glass rounded-[40px] p-8 md:p-10 relative group border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        
        {/* Upload & Preview Area */}
        <div className="w-full md:w-1/2">
           <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`relative w-full aspect-square rounded-[32px] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
              ${imagePreview ? 'border-indigo-500/50' : 'border-slate-200 hover:border-indigo-500/30 hover:bg-slate-50'}
            `}
           >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover rounded-[30px]" alt="Leaf sample" />
            ) : (
              <div className="text-center space-y-4">
                <div className="p-5 bg-slate-100 rounded-3xl mx-auto w-fit group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg">Click or drag leaf photo</p>
                  <p className="text-slate-500 text-sm">Drone imagery or mobile camera shots</p>
                </div>
              </div>
            )}
            
            {analyzing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-indigo-600 font-black tracking-widest uppercase text-xs">Processing Neurons...</p>
              </div>
            )}
           </div>
        </div>

        {/* Analysis Trigger & Stats */}
        <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                <Cpu className="w-3 h-3" />
                Next-Gen Neural Engine
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-3xl font-black leading-tight uppercase tracking-tight">
                Intellectual <br /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 drop-shadow-sm">
                  Crop diagnostics
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Selected Cultivar</label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border-2 border-slate-100 hover:border-indigo-500/30 rounded-[32px] px-6 py-5 text-sm font-bold flex items-center justify-between transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <span className="text-slate-700">{cropType}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : 'rotate-0'}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Interaction Barrier Backdrop */}
                      <div 
                        className="fixed inset-0 z-40 bg-transparent cursor-default" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-xl border-2 border-slate-100 shadow-2xl rounded-[32px] overflow-hidden p-2"
                      >
                        <div className="max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                          {['Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Rice', 'Wheat'].map((crop) => (
                            <button
                              key={crop}
                              onClick={() => {
                                setCropType(crop);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold rounded-2xl transition-all mb-1 last:mb-0
                                ${cropType === crop ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}
                              `}
                            >
                              {crop}
                              {cropType === crop && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
          <button 
            disabled={!file || analyzing}
            onClick={handleUpload}
            className={`w-full py-5 rounded-[28px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all
              ${file && !analyzing ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 translate-y-0 active:translate-y-1' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Activity className="w-5 h-5" />
            Commence Intelligence Analysis
          </button>
        </div>
      </div>
    </section>
  );
}
