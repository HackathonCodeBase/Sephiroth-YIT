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
  const [analyzing, setAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<unknown>(null);
  const [cropType, setCropType] = useState('Tomato');
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
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);

    setTimeout(() => {
      const mockResult = {
        "analysis": {
          "disease_detected": "Tomato Yellow Leaf Curl Virus",
          "confidence": 0.92,
          "severity": "Moderate",
          "timestamp": Date.now() / 1000
        },
        "intelligence": {
          "ai_insights": {
            "location": "Mangalore, Karnataka, India",
            "time_context": "Early Morning — ideal spraying window",
            "remedies": [
              "Remove infected plants immediately to prevent vector spread",
              "Apply neem oil spray now (6–8 AM is optimal in Kerala humidity)",
              "Deploy yellow sticky traps to control whitefly vectors",
              "Avoid chemical spraying — rain forecast within 6 hours",
              "Monitor adjacent sectors; high humidity accelerates spread"
            ],
            "recovery": "14–21 days with immediate intervention",
            "preventive_note": "Pre-monsoon conditions in Kerala increase fungal risk — inspect weekly"
          },
          "crop_type": cropType
        },
        "status": "success"
      };

      try {
        sessionStorage.setItem('cropAnalysisResults', JSON.stringify(mockResult));
        if (imagePreview) {
            sessionStorage.setItem('cropImagePreview', imagePreview);
        }
        setAnalyzing(false);
        router.push('/analysis');
      } catch (err) {
        console.error("Storage failed:", err);
        setAnalyzing(false);
      }
    }, 1500);
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

        <div className="flex justify-center w-full">
          <div className="w-full max-w-4xl">
            <AnalysisPanel 
              imagePreview={imagePreview}
              file={file}
              analyzing={analyzing}
              cropType={cropType}
              setCropType={setCropType}
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
            Powered by Matrix Fusion Sephiroth Engine
          </p>
        </div>
      </div>
    </main>
  );
}
