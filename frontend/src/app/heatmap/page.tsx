'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import MapComponent from '@/components/MapComponent';
import { API_BASE_URL } from '@/config';

// Base coordinates for simulation (Node A / origin)
const BASE_LAT = 40.7250;
const BASE_LON = -73.9980;

export default function HeatmapPage() {
  const [data, setData] = useState<any[]>([]);
  const [backendStatus, setBackendStatus] = useState<unknown>({ status: "active" });
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // 'B' (inside 2km) | 'C' (outside 2km)
  const [simRole, setSimRole] = useState<string>('B');
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [simRole]);

  const connectWebSocket = () => {
    if (wsRef.current) {
        wsRef.current.close();
    }
      
    const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/v1/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      const latOffset = simRole === 'B' ? 0.0045 : 0.032; // ~0.5km and ~3.5km
      
      const sendLocation = (lat: number, lon: number) => {
        const myLat = lat + latOffset;
        const myLon = lon;
        
        ws.send(JSON.stringify({
          type: "REGISTER_LOCATION",
          latitude: myLat,
          longitude: myLon
        }));
        
        // Add ourselves to the map so we can see B/C visually
        setData(prev => {
          // Remove existing simulation role marker if any
          const filtered = prev.filter(p => !p.is_simulator);
          return [...filtered, {
            id: `sim-${simRole}`,
            latitude: myLat,
            longitude: myLon,
            is_simulator: true,
            simRole,
            crop: `Person ${simRole}`,
            disease: `Simulation Client`,
            description: `Distance from A approx ${simRole === 'B' ? '0.5' : '3.5'} km.`
          }];
        });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => sendLocation(position.coords.latitude, position.coords.longitude),
          (error) => sendLocation(BASE_LAT, BASE_LON)
        );
      } else {
        sendLocation(BASE_LAT, BASE_LON);
      }
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "NEW_OUTBREAK") {
        setData((prev) => {
          // Update simulator marker status
          const updated = prev.map(p => {
             if (p.is_simulator) {
               return {
                 ...p, 
                 notified: msg.is_at_risk,
                 last_distance: msg.client_distance_km
               };
             }
             return p;
          });
          return [...updated, msg.data];
        });
        
        // Filter out if not at risk and user wanted it that way, but let's just let the UI handle showing it as "safe"
        // Wait, requirement: "while the third person ... outside 2km radius ... so he isnt notified abt this issue"
        if (msg.is_at_risk) {
           showToastAlert({ ...msg.data, distance_km: msg.client_distance_km, is_at_risk: msg.is_at_risk });
        } else {
           // For simulation visibility, we can show a silent gray notice, or just ignore. The prompt says "he isnt notified"
           // So we do nothing! But for the sake of demo, maybe a console log is good.
           console.log("Ignored alert (outside 2km radius):", msg.client_distance_km);
        }
      }
    };
  };

  const showToastAlert = (outbreak: any) => {
    setAlerts((prev) => [outbreak, ...prev].slice(0, 3));
    setTimeout(() => {
      setAlerts((prev) => prev.filter(a => a.id !== outbreak.id));
    }, 8000);
  };

  const fetchInitialData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/outbreaks`);
      if (res.ok) {
        const json = await res.json();
        setData(prev => {
          const sims = prev.filter(p => p.is_simulator);
          return [...json, ...sims];
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans px-4 pb-4 md:px-8 md:pb-8 pt-[120px] md:pt-[140px] flex flex-col items-center relative">
      {/* Background decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-teal-500/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, #0f172a 1px, transparent 0)', 
            backgroundSize: '48px 48px' 
          }}>
        </div>
      </div>

      <div className="w-full max-w-6xl space-y-4 relative z-10">
        <Header backendStatus={!!backendStatus} />
        
        {/* Simulation Control Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4 items-center mb-4">
            <span className="font-bold text-sm text-slate-600">Simulation Identity:</span>
            <button 
               onClick={() => setSimRole('B')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${simRole === 'B' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>
                Person B (Within 2km)
            </button>
            <button 
               onClick={() => setSimRole('C')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${simRole === 'C' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>
                Person C (&gt; 5km away)
            </button>
            <span className="text-xs text-slate-400 ml-auto">
               (Upload an infected crop in a separate tab to trigger)
            </span>
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-32 right-4 z-50 flex flex-col gap-2">
          {alerts.map((alert) => (
             <div key={alert.id} className="bg-rose-600 shadow-2xl rounded-xl p-4 text-white animate-pulse w-80 backdrop-blur border border-rose-400">
                <div className="text-[10px] uppercase font-bold tracking-widest bg-black/20 inline-block px-2 py-0.5 rounded-full mb-1">
                   HIGH RISK: NEARBY OUTBREAK
                </div>
                <div className="font-bold text-lg leading-tight mb-1">
                   {alert.crop}: <span className="underline">{alert.disease.replace(/_/g, ' ')}</span>
                </div>
                {alert.distance_km && (
                  <div className="text-sm font-semibold mb-2 text-rose-100 bg-rose-800/50 p-2 rounded-md">
                     ⚠️ {alert.distance_km.toFixed(1)} km away from your location
                  </div>
                )}
                
                <div className="text-xs space-y-1 bg-white/10 p-2 rounded">
                  <div className="font-bold">Precautionary Methods:</div>
                  <ul className="list-disc pl-4 opacity-90">
                    <li>Isolate surrounding crops immediately.</li>
                    <li>Apply organic fungicides as recommended.</li>
                    <li>Monitor nearby fields for early symptoms.</li>
                  </ul>
                </div>
             </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 md:p-8 shadow-2xl ring-1 ring-slate-100 mb-8">
          <div className="mb-6 flex justify-between items-center">
             <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">
               Global Outbreak Intel
             </h2>
             <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
               LIVE LIVE LIVE
             </span>
          </div>

          <MapComponent data={data} />
          
        </div>
      </div>
    </main>
  );
}
