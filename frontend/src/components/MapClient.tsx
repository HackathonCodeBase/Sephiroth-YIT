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
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.4: 'green',
          0.6: 'cyan',
          0.7: 'lime',
          0.8: 'yellow',
          1.0: 'red',
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
          .map((item, idx) => (
            <Marker key={item.id || idx} position={[item.latitude, item.longitude]}>
              <Popup>
                {item.is_simulator ? (
                  <div className="font-sans text-center min-w-[150px]">
                    <div className="font-bold text-sm text-slate-800 uppercase mb-1">
                      {item.crop}
                    </div>
                    <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded-lg italic border border-blue-200 mb-2">
                      {item.description}
                    </div>
                    
                    {item.notified !== undefined && (
                      <div className={`mt-2 p-1.5 rounded text-xs font-bold text-white uppercase tracking-wider ${item.notified ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                        {item.notified ? `ALERTED (${item.last_distance?.toFixed(1)} km)` : `SAFE / NO ALERT (${item.last_distance?.toFixed(1)} km)`}
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
        ))}
      </MapContainer>
    </div>
  );
}
