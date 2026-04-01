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
  const [analyzing, setAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<unknown>(null);
  const [cropType, setCropType] = useState('Tomato');
  const [visionEngine, setVisionEngine] = useState('consolidated_core');
  const [blurError, setBlurError] = useState<string | null>(null);
  const [checkingBlur, setCheckingBlur] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');

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
    }
  };

  const onEngineChange = (engineId: string) => {
    setVisionEngine(engineId);
    // Auto-re-analyze if an image is already uploaded
    if (file && !analyzing) {
       handleUpload(engineId);
    }
  };

  const handleUpload = async (overrideEngine?: string) => {
    if (!file) return;
    setAnalyzing(true);

    try {
      // Import API_BASE_URL dynamically or assume it's available
      const { API_BASE_URL } = await import('@/config');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('crop_type', cropType);
      formData.append('vision_engine', overrideEngine || visionEngine);
      
      if (latitude !== null && longitude !== null) {
        formData.append('latitude', String(latitude));
        formData.append('longitude', String(longitude));
      }
      formData.append('description', description);

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
      sessionStorage.setItem('cropAnalysisResults', JSON.stringify(result));
      if (imagePreview) {
          sessionStorage.setItem('cropImagePreview', imagePreview);
      }
      
      setAnalyzing(false);
      router.push('/analysis');
    } catch (err) {
      console.error("Analysis failed:", err);
      // In case of error, show alert or handle gracefully
      alert(err instanceof Error ? err.message : "Error connecting to AI Matrix");
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

        <div className="flex justify-center w-full">
          <div className="w-full max-w-4xl">
            <AnalysisPanel 
              imagePreview={imagePreview}
              file={file}
              analyzing={analyzing}
              cropType={cropType}
              setCropType={setCropType}
              visionEngine={visionEngine}
              setVisionEngine={setVisionEngine}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
              blurError={blurError}
              checkingBlur={checkingBlur}
              description={description}
              setDescription={setDescription}
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
