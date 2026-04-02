'use client';

import { useState, useEffect } from 'react';
import { checkImageClarity } from '@/utils/imageClarity';

import { useRouter } from 'next/navigation';

// Component Imports
import Header from '@/components/Header';
import AnalysisPanel from '@/components/AnalysisPanel';

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Temporal Analysis State
  const [isTemporalMode, setIsTemporalMode] = useState(false);
  const [file2, setFile2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<unknown>(null);
  const [cropType, setCropType] = useState('Tomato');
  const [visionEngine, setVisionEngine] = useState('consolidated_core');
  const [blurError, setBlurError] = useState<string | null>(null);
  const [checkingBlur, setCheckingBlur] = useState(false);

  useEffect(() => {
    // Set system as online immediately for demonstration
    setBackendStatus({ status: "active", version: "2.1.0" });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setBlurError(null);
      setFile(null); 
      setImagePreview(null);
      setCheckingBlur(true);

      const { isClear, error } = await checkImageClarity(selectedFile);
      setCheckingBlur(false);
      
      if (!isClear) {
        setBlurError(error || "IMAGE RESOLUTION FAILURE");
        return;
      }

      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      // Auto-set today's date if empty
      if (!date1) setDate1(new Date().toISOString().split('T')[0]);
    }
  };

  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile2(selectedFile);
      setImagePreview2(URL.createObjectURL(selectedFile));
      // Auto-set today's date if empty
      if (!date2) setDate2(new Date().toISOString().split('T')[0]);
    }
  };

  const handleUpload = async (overrideEngine?: string) => {
    if (!file) return;
    if (isTemporalMode && !file2) return;
    
    setAnalyzing(true);

    try {
      const { API_BASE_URL } = await import('@/config');
      
      const formData = new FormData();
      
      if (isTemporalMode && file2) {
        formData.append('file1', file);
        formData.append('file2', file2);
        formData.append('date1', date1);
        formData.append('date2', date2);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/temporal/compare`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Temporal analysis failed');
        }

        const result = await response.json();
        
        // Store temporal results
        sessionStorage.setItem('cropAnalysisResults', JSON.stringify({
          ...result,
          isTemporal: true,
          baselinePreview: imagePreview,
          latestPreview: imagePreview2,
          baselineDate: date1,
          latestDate: date2
        }));
        
        router.push('/analysis');
      } else {
        formData.append('file', file);
        formData.append('crop_type', cropType);
        formData.append('vision_engine', overrideEngine || visionEngine);

        const response = await fetch(`${API_BASE_URL}/api/v1/crop-analysis`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Analysis failed');
        }

        const result = await response.json();
        
        sessionStorage.setItem('cropAnalysisResults', JSON.stringify({
          ...result,
          isTemporal: false
        }));
        if (imagePreview) {
            sessionStorage.setItem('cropImagePreview', imagePreview);
        }
        
        router.push('/analysis');
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      alert(err instanceof Error ? err.message : "Error connecting to AI Matrix");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden pt-[110px]">
      {/* Matrix / Sephiroth Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-orange-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-rose-500/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, #f97316 1px, transparent 0)', 
            backgroundSize: '48px 48px' 
          }}>
        </div>
      </div>

      <div className="w-full max-w-5xl space-y-8 md:space-y-12 relative z-10">
        <Header 
          backendStatus={!!backendStatus} 
        />

        <div className="flex flex-col items-center gap-8">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1.5 rounded-[24px] flex items-center shadow-inner border border-slate-200">
            <button 
              onClick={() => setIsTemporalMode(false)}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${!isTemporalMode ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Matrix Scan
            </button>
            <button 
              onClick={() => setIsTemporalMode(true)}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${isTemporalMode ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Temporal Analysis
            </button>
          </div>

          <div className="w-full max-w-4xl">
            <AnalysisPanel 
              imagePreview={imagePreview}
              file={file}
              imagePreview2={imagePreview2}
              file2={file2}
              isTemporalMode={isTemporalMode}
              handleFile2Change={handleFile2Change}
              date1={date1}
              setDate1={setDate1}
              date2={date2}
              setDate2={setDate2}
              analyzing={analyzing}
              cropType={cropType}
              setCropType={setCropType}
              visionEngine={visionEngine}
              setVisionEngine={setVisionEngine}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
              blurError={blurError}
              checkingBlur={checkingBlur}
            />
          </div>
        </div>
        
        {/* Footnote Branding */}
        <div className="flex justify-center pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            Powered by Sephiroth AgroCare Neural Engine
          </p>
        </div>
      </div>
    </main>
  );
}
