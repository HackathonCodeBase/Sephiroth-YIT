'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/config';

// Component Imports
import Header from '@/components/Header';
import AnalysisPanel from '@/components/AnalysisPanel';
import DiagnosticReport from '@/components/DiagnosticReport';
import RemediationSection from '@/components/RemediationSection';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [droneStatus, setDroneStatus] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [cropType, setCropType] = useState('Tomato');

  useEffect(() => {
    // Initial health check
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(() => setBackendStatus(null));

    // Fetch drone status
    fetch(`${API_BASE_URL}/api/v1/drone-feed-status`)
      .then(res => res.json())
      .then(data => setDroneStatus(data))
      .catch(() => setDroneStatus(null));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('crop_type', cropType);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/crop-analysis`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans p-6 overflow-x-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 relative z-10">
        <Header 
          droneStatus={droneStatus} 
          backendStatus={!!backendStatus} 
        />

        <div className="flex justify-center">
          <div className="w-full max-w-4xl space-y-8">
            <AnalysisPanel 
              imagePreview={imagePreview}
              file={file}
              analyzing={analyzing}
              cropType={cropType}
              setCropType={setCropType}
              handleFileChange={handleFileChange}
              handleUpload={handleUpload}
            />

            <AnimatePresence mode="wait">
              {results && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-4"
                >
                  <DiagnosticReport results={results} />
                  <RemediationSection results={results} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
