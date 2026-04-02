'use client';

import { useState, useEffect } from 'react';
import { checkImageClarity } from '@/utils/imageClarity';
import exifr from 'exifr/dist/lite.esm.js';

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
  const [llmProvider, setLlmProvider] = useState('auto');
  const [blurError, setBlurError] = useState<string | null>(null);
  const [checkingBlur, setCheckingBlur] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Basic check to see if it's too large, but most mobile photos are around 2-4MB 
        // Data URL will be larger. If it fails to save later, we will catch it.
        setImagePreview(result);
      };
      reader.readAsDataURL(selectedFile);

      try {
        const gpsData = await exifr.gps(selectedFile);
        if (gpsData && gpsData.latitude && gpsData.longitude) {
          setLatitude(gpsData.latitude);
          setLongitude(gpsData.longitude);
        } else {
          // Fallback to browser geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
            });
          }
        }
      } catch (err) {
        console.warn("Could not read EXIF data:", err);
      }
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
        formData.append('vision_engine', visionEngine);
        formData.append('crop_type', cropType);
        formData.append('llm_provider', llmProvider);
        if (latitude) formData.append('latitude', latitude.toString());
        if (longitude) formData.append('longitude', longitude.toString());
        
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
        formData.append('llm_provider', llmProvider);
        if (latitude) formData.append('latitude', latitude.toString());
        if (longitude) formData.append('longitude', longitude.toString());

        const response = await fetch(`${API_BASE_URL}/api/v1/crop-analysis`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Analysis failed');
        }

        const result = await response.json();
        
        // Store real results in session storage for the analysis page
        sessionStorage.setItem('cropAnalysisResults', JSON.stringify({
          ...result,
          isTemporal: false
        }));
        
        if (imagePreview) {
          try {
            sessionStorage.setItem('cropImagePreview', imagePreview);
          } catch(e) {
            console.warn("Could not save image preview to session storage due to size limits.", e);
          }
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
    <main className="min-h-screen bg-white text-slate-900 font-sans px-4 pb-4 md:px-8 md:pb-8 pt-[120px] md:pt-[140px] flex flex-col items-center justify-center relative overflow-hidden">
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
              onClick={() => {
                setIsTemporalMode(true);
                setVisionEngine('consolidated_core');
                setLlmProvider('groq');
              }}
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
              llmProvider={llmProvider}
              setLlmProvider={setLlmProvider}
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

      {/* Futuristic Loading Overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="text-center space-y-6 max-w-xs px-6">
            <div className="relative mx-auto w-24 h-24">
               <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
               <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
               <div className="absolute inset-0 m-auto w-8 h-8 text-orange-500 animate-pulse flex items-center justify-center">
                  <div className="w-2 h-8 bg-orange-500/20 absolute rotate-45"></div>
                  <div className="w-2 h-8 bg-orange-500/20 absolute -rotate-45"></div>
                  <span className="font-black text-[10px]">AI</span>
               </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Pathology Core Active</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 animate-pulse">Generating Matrix Report...</p>
              <div className="flex gap-1 justify-center">
                 <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
