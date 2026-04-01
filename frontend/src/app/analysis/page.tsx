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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DiagnosticReport results={results} onEngineChange={reAnalyze} />
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* LEFT SIDE: Image (35%) */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[35%] flex flex-col min-h-0"
          >
            {imagePreview && (
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
            )}
          </motion.div>

          {/* RIGHT SIDE: Recommendations (65%) */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[65%] flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto pr-1">
              <RemediationSection results={results} />
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
