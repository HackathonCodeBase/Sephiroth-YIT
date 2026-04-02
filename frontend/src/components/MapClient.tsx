'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// Fix Leaflet's missing marker icons in Next.js/Webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapClientProps {
  data: any[];
}

// Auto Zoom Component
function AutoZoomLayer({ data }: { data: any[] }) {
  const map = useMap();
  useEffect(() => {
    const validData = data.filter((item) => item.latitude && item.longitude && !item.is_simulator);
    if (validData.length > 0) {
      const bounds = L.latLngBounds(validData.map((d) => [d.latitude, d.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [map, data]);
  return null;
}

function HeatmapLayer({ data }: { data: any[] }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const points = data
      .filter((item) => item.latitude && item.longitude && !item.is_simulator)
      .map((item) => {
        // Higher intensity for disease vs healthy
        const isHealthy = item.disease && item.disease.toLowerCase().includes('healthy');
        const intensity = isHealthy ? 0.3 : 1.0;
        return [item.latitude, item.longitude, intensity] as L.HeatLatLngTuple;
      });

    // @ts-ignore
    if (L.heatLayer) {
      // @ts-ignore
      layerRef.current = L.heatLayer(points, {
        radius: 35,
        blur: 20,
        maxZoom: 13,
        minOpacity: 0.4,
        gradient: {
          0.2: '#3b82f6', // blue
          0.4: '#22d3ee', // cyan
          0.6: '#4ade80', // green
          0.8: '#facc15', // yellow
          1.0: '#ef4444'  // red
        },
      }).addTo(map);
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, data]);

  return null;
}

export default function MapClient({ data }: MapClientProps) {
  // Default center (can be user's loc or center of the world)
  const defaultCenter: [number, number] = [20.0, 77.0]; 

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div style={{ height: '70vh', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
      <MapContainer center={defaultCenter} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoZoomLayer data={data} />
        <HeatmapLayer data={data} />
        {data
          .filter((item) => item.latitude && item.longitude)
          .map((item, idx) => {
            let simNotified = item.notified;
            let simDistance = item.last_distance;
            
            if (item.is_simulator) {
               const outbreaks = data.filter(d => !d.is_simulator && d.latitude && d.longitude);
               if (outbreaks.length > 0 && typeof simDistance === 'undefined') {
                   const latest = outbreaks[outbreaks.length - 1];
                   simDistance = getDistance(item.latitude, item.longitude, latest.latitude, latest.longitude);
                   simNotified = simDistance <= 2.0;
               }
            }

            return (
            <Marker key={item.id || idx} position={[item.latitude, item.longitude]}>
              <Popup>
                {item.is_simulator ? (
                  <div className="font-sans text-center min-w-[200px]">
                    <div className="font-bold text-sm text-slate-800 uppercase mb-1">
                      {item.crop}
                    </div>
                    <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded-lg italic border border-blue-200 mb-2">
                      {item.description}
                    </div>
                    
                    {simNotified !== undefined ? (
                      simNotified ? (
                        <div className="mt-2 p-2 rounded text-xs font-bold text-white bg-rose-500 shadow-md uppercase tracking-wider text-center">
                          🚨 NOTIFIED
                        </div>
                      ) : (
                        <div className="mt-2 p-2 rounded text-[10px] font-bold text-slate-600 bg-slate-100 uppercase tracking-widest border border-slate-200 text-center">
                          📍 OUTSIDE ALERT ZONE
                        </div>
                      )
                    ) : (
                      <div className="mt-2 p-2 rounded text-[10px] font-bold text-slate-500 bg-slate-100 uppercase tracking-wider border border-slate-200 border-dashed">
                        AWAITING OUTBREAK NOTIFICATION...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-sans">
                     <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                       {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                     </div>
                     <div className="font-bold text-sm text-slate-800 uppercase">
                       {item.crop}: {item.disease?.replace(/_/g, ' ')}
                     </div>
                     {item.description && (
                       <div className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg italic border border-slate-200">
                         "{item.description}"
                       </div>
                     )}
                  </div>
                )}
              </Popup>
            </Marker>
          )})
        }
      </MapContainer>
    </div>
  );
}
