'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, Send, User, Sparkles, Activity } from 'lucide-react';

import DiagnosticReport from '@/components/DiagnosticReport';
import RemediationSection from '@/components/RemediationSection';
import Header from '@/components/Header';

export default function AnalysisPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAborted, setIsAborted] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem('cropAnalysisResults');
      const storedImage = sessionStorage.getItem('cropImagePreview');
      
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      } else {
        router.replace('/');
      }
      
      if (storedImage) {
        setImagePreview(storedImage);
      }
    } catch (e) {
      console.error(e);
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Accessing Matrix...</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans p-4 md:p-8 overflow-x-hidden flex flex-col pt-[110px]">
      <Header backendStatus={true} />

      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col flex-1 h-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-black text-[10px] uppercase tracking-widest transition-all group"
          >
            <div className="p-2.5 bg-slate-100 group-hover:bg-orange-50 rounded-xl transition-colors border border-slate-200 group-hover:border-orange-200">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Initialize New Scan
          </button>
          
          <div className="flex items-center gap-4">
             {!isAborted && (
               <button 
                onClick={() => setIsAborted(true)}
                className="px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm hover:shadow-rose-200 active:scale-95"
               >
                Abort Matrix
               </button>
             )}
             <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-2xl border border-orange-100">
                <Activity className={`w-3.5 h-3.5 text-orange-500 ${!isAborted ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                  {isAborted ? 'Analysis Optimized' : 'Pathology Logged'}
                </span>
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 pb-6">
          
          {/* LEFT SIDE: Results */}
          <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col gap-6 transition-all duration-500 ${isAborted ? 'w-full' : 'w-full lg:w-[65%]'}`}
          >
            {imagePreview && (
              <div className="glass-white p-4 rounded-[40px] shadow-sm border border-orange-100/50">
                 <div className="relative w-full h-[200px] md:h-[320px] rounded-[28px] overflow-hidden group border border-slate-100 shadow-inner">
                   <img src={imagePreview} alt="Crop sample" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl">
                        <Sparkles className="w-4 h-4 text-orange-300" />
                        Scanned Matrix Subject: {results.intelligence?.crop_type}
                      </div>
                   </div>
                 </div>
              </div>
            )}
            
            <div className={`grid grid-cols-1 gap-6 ${isAborted ? 'md:grid-cols-2' : ''}`}>
              <DiagnosticReport results={results} />
              <RemediationSection results={results} />
            </div>
          </motion.div>

          {/* RIGHT SIDE: Chatbot */}
          <AnimatePresence>
            {!isAborted && (
              <motion.div 
                key="chatbot"
                initial={{ opacity: 0, x: 20, width: '35%' }}
                animate={{ opacity: 1, x: 0, width: '35%' }}
                exit={{ opacity: 0, x: 50, width: '0%', marginLeft: -32 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:flex h-auto glass-white rounded-[40px] p-2 border border-orange-100 shadow-2xl shadow-orange-500/5 bg-white/80 backdrop-blur-2xl overflow-hidden flex-col"
              >
                <div className="p-6 flex items-center justify-between border-b border-orange-50 bg-white/50 backdrop-blur-md rounded-t-[38px]">
                  <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-3.5 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl shadow-lg ring-4 ring-orange-50">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-sm"></div>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 tracking-tight leading-none text-base">SEPHIROTH AI</h3>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1.5 block">Neural Agronomist</span>
                      </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
                  <div className="flex items-start gap-4 animate-in slide-in-from-left-4 duration-500">
                    <div className="p-2 bg-orange-100 rounded-xl text-orange-600 shrink-0 mt-1 shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white p-5 rounded-[28px] rounded-tl-sm shadow-sm border border-orange-50 text-[13px] font-bold text-slate-700 leading-relaxed max-w-[90%] shadow-orange-500/5">
                      Completed <strong>{results.intelligence?.crop_type}</strong> analysis. Detect level: <strong>{results.analysis?.severity}</strong>. <br /><br />
                      Would you like the chemical synthesis list or organic remediation protocols?
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-3 animate-in slide-in-from-right-4 duration-500">
                    <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-5 rounded-[28px] rounded-tr-sm shadow-xl shadow-orange-500/20 text-[13px] font-black text-white leading-relaxed max-w-[90%] uppercase tracking-tight">
                      Show me organic remediation.
                    </div>
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-400 shrink-0 mt-1 border border-slate-200">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white/80 backdrop-blur-md rounded-b-[38px] border-t border-orange-50">
                  <div className="flex items-center gap-3 bg-orange-50/50 p-2.5 rounded-[28px] border border-orange-100 shadow-inner focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                      <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Query Matrix Core..." 
                        className="flex-1 bg-transparent border-none focus:outline-none px-4 text-xs font-black text-slate-700 placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-widest"
                      />
                      <button 
                        className="p-3.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-[22px] hover:scale-105 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        <div className="flex justify-center pb-8 pt-4">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Sephiroth Neural Output Section 4-A</p>
        </div>
      </div>
    </main>
  );
}
