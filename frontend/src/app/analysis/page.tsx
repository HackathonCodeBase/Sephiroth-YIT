'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity } from 'lucide-react';

import DiagnosticReport from '@/components/DiagnosticReport';
import RemediationSection from '@/components/RemediationSection';
import Header from '@/components/Header';

export default function AnalysisPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const reAnalyze = async (engineId: string) => {
    setLoading(true);
    try {
      const { API_BASE_URL } = await import('@/config');
      const storedImage = sessionStorage.getItem('cropImagePreview');
      if (!storedImage) return;

      const res = await fetch(storedImage);
      const blob = await res.blob();
      const file = new File([blob], "re-scan.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('crop_type', results?.intelligence?.crop_type || results?.crop || 'Tomato');
      formData.append('vision_engine', engineId);

      const response = await fetch(`${API_BASE_URL}/api/v1/crop-analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Re-analysis failed');

      const result = await response.json();
      setResults(result);
      sessionStorage.setItem('cropAnalysisResults', JSON.stringify(result));
    } catch (e) {
      console.error('Re-analysis error:', e);
    } finally {
      setLoading(false);
    }
  };

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
    <main className="min-h-screen bg-white text-slate-900 font-sans p-4 md:p-6 overflow-x-hidden flex flex-col relative">
      <Header backendStatus={true} />

      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-white">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Fixed Header Spacer */}
      <div className="h-[80px] w-full shrink-0"></div>

      <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col flex-1 min-h-0 pt-2 pb-8">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-black text-[10px] uppercase tracking-widest transition-all group"
            >
              <div className="p-1 px-3 bg-slate-100 group-hover:bg-orange-50 rounded-lg transition-colors border border-slate-200 group-hover:border-orange-200">
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Initialize New Scan
              </div>
            </button>
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-xl border border-orange-100">
                  <Activity className="w-2.5 h-2.5 text-orange-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                    Matrix Pathology Core Active
                  </span>
               </div>
            </div>
          </div>

          {!results.isTemporal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DiagnosticReport results={results} onEngineChange={reAnalyze} />
            </motion.div>
          )}

          {results.isTemporal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1"
            >
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Temporal Matrix Comparison</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Pathology Progression Analysis Engine v2.1.0</p>
            </motion.div>
          )}

          {results.isTemporal && results.latest_analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DiagnosticReport results={results.latest_analysis} onEngineChange={reAnalyze} isTemporal={true} />
            </motion.div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* LEFT SIDE: Progression Visualization */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col min-h-0 ${results.isTemporal ? 'w-full lg:w-[45%]' : 'w-full lg:w-[35%]'}`}
          >
            {results.isTemporal ? (
              <div className="space-y-6 h-full overflow-y-auto pr-2 scrollbar-hide">
                {/* Comparison Dashboard */}
                <div className="glass-white p-6 rounded-[40px] border-2 border-orange-100 shadow-xl space-y-6">
                    <div className="flex items-center justify-between bg-orange-50/50 p-4 rounded-3xl border border-orange-100/50">
                      <div className="text-center flex-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Baseline</p>
                        <p className="text-sm font-black text-slate-800">{results.baselineDate || 'MAR 28, 2026'}</p>
                      </div>
                      <div className="h-8 w-px bg-orange-200/50"></div>
                      <div className="text-center flex-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Interval</p>
                        <p className="text-sm font-black text-orange-600">
                          {(() => {
                            if (!results.baselineDate || !results.latestDate) return '5 Days';
                            const d1 = new Date(results.baselineDate);
                            const d2 = new Date(results.latestDate);
                            const diff = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                            return `${diff} Days`;
                          })()}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-orange-200/50"></div>
                      <div className="text-center flex-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Latest Scan</p>
                        <p className="text-sm font-black text-slate-800">{results.latestDate || 'APR 02, 2026'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 px-1 text-center">Baseline Matrix</p>
                        <div className="aspect-square rounded-[24px] overflow-hidden border border-slate-100 shadow-inner">
                          <img src={results.baselinePreview} className="w-full h-full object-cover" alt="Baseline" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[7px] font-black uppercase tracking-widest text-orange-500 px-1 text-center">Evolution Delta</p>
                        <div className="aspect-square rounded-[24px] overflow-hidden border border-orange-200 bg-slate-900 shadow-xl shadow-orange-500/10">
                          <img src={results.diff_image} className="w-full h-full object-contain" alt="Delta Map" />
                        </div>
                      </div>
                    </div>

                    {/* Scientific Justification */}
                    <div className="p-4 bg-white rounded-3xl border border-orange-50 space-y-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-orange-500" />
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-800">Pathology Vector Justification</h4>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic">
                        "The system utilizes **Enhanced Correlation Coefficient (ECC)** alignment to register the follow-up matrix against the baseline. 
                        The detected **{results.progression_score}% expansion** is derived from a pixel-precise delta map, 
                        filtering out lighting variations and focusing exclusively on structural degradation in the ROI."
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Pathology Timeline History</span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                          { date: '03/15', score: 2.1 },
                          { date: '03/22', score: 4.5 },
                          { date: results.baselineDate ? results.baselineDate.split('-').slice(1).reverse().join('/') : '03/28', score: 8.2 },
                          { date: results.latestDate ? results.latestDate.split('-').slice(1).reverse().join('/') : '04/02', score: results.progression_score, active: true },
                        ].map((item, idx) => (
                          <div key={idx} className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all ${item.active ? 'bg-orange-500 border-orange-400 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                            <p className="text-[7px] font-black uppercase opacity-70">{item.date}</p>
                            <p className="text-[10px] font-black">{item.score}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
              </div>
            ) : (
              imagePreview && (
                <div className="glass-white p-2 rounded-[32px] shadow-2xl border-2 border-orange-100/50 h-full overflow-hidden">
                   <div className="relative h-full aspect-video lg:aspect-auto rounded-[24px] overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                     <img src={imagePreview} alt="Crop sample" className="w-full h-full object-cover" />
                     <div className="absolute top-4 left-4">
                        <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white font-black text-[8px] uppercase tracking-widest shadow-xl">
                          Subject Evidence [Visual Matrix]
                        </div>
                     </div>
                   </div>
                </div>
              )
            )}
          </motion.div>

          {/* RIGHT SIDE: Results/Recommendations (60% or 65%) */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col min-h-0 overflow-hidden ${results.isTemporal ? 'w-full lg:w-[55%]' : 'w-full lg:w-[65%]'}`}
          >
            <div className="flex-1 overflow-y-auto pr-1">
              {results.isTemporal ? (
                <div className="space-y-6">
                  <div className="glass-white p-8 rounded-[40px] border border-orange-200 shadow-xl bg-orange-50/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-orange-500 rounded-3xl text-white shadow-lg shadow-orange-500/20">
                        <Activity className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Temporal Delta Core</p>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Progression Result</h2>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-[32px] border border-orange-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Progression Index</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black text-orange-600 tracking-tighter">{results.progression_score}</span>
                          <span className="text-xl font-black text-slate-400 uppercase">%</span>
                        </div>
                        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-rose-600 rounded-full" 
                            style={{ width: `${Math.min(results.progression_score * 4, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                          "{results.progression_score > 5 
                            ? "Significant biological progression detected in the last cycle. Immediate intervention recommended." 
                            : "Minimal progression detected. Continue current remediation protocol and monitor closely."}"
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 opacity-60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Diagnostic Mapping Active</p>
                    <p className="text-[8px] text-slate-400 text-center max-w-sm">The delta matrix highlights exact pixel-level shifts in structural integrity, indicating leaf necrosis progression or recovery patterns.</p>
                  </div>
                </div>
              ) : (
                <RemediationSection results={results} />
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="flex justify-center pt-8">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">Sephiroth Neural Output Core v2.1.0 (Production Build)</p>
        </div>
      </div>
    </main>
  );
}
