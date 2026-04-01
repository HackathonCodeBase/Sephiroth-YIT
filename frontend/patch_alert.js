const fs = require('fs');
let file = fs.readFileSync('frontend/src/app/heatmap/page.tsx', 'utf8');
const oldMarkup = `          {alerts.map((alert) => (
             <div key={alert.id} className="bg-rose-600 shadow-2xl rounded-xl p-4 text-white animate-pulse w-80 backdrop-blur border border-rose-400">
                <div className="text-[10px] uppercase font-bold tracking-widest bg-black/20 inline-block px-2 py-0.5 rounded-full mb-1">
                   NEW OUTBREAK ALERT
                </div>
                <div className="font-bold text-lg leading-tight mb-2">
                   {alert.crop}: <span className="underline">{alert.disease.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-xs text-white/80">
                  Lat: {alert.latitude?.toFixed(4)}, Lon: {alert.longitude?.toFixed(4)}
                </div>
             </div>
          ))}`;

const newMarkup = `          {alerts.map((alert) => {
             const isWarning = alert.is_at_risk;
             const bgColor = isWarning ? "bg-rose-600 border-rose-400" : "bg-orange-500 border-orange-300";
             const titleText = isWarning ? "HIGH RISK: NEARBY OUTBREAK" : "REGIONAL ALERT";
             const distText = alert.distance_km ? \`\${alert.distance_km.toFixed(1)} km away\` : 'Outbreak Detected';
             
             return (
               <div key={alert.id} className={\`\${bgColor} shadow-2xl rounded-xl p-4 text-white animate-pulse w-80 backdrop-blur border-2\`}>
                  <div className="text-[10px] uppercase font-bold tracking-widest bg-black/20 inline-block px-2 py-0.5 rounded-full mb-1">
                     {titleText}
                  </div>
                  <div className="font-bold text-lg leading-tight mb-2">
                     {alert.crop}: <span className="underline">{alert.disease.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-xs text-white/90 font-medium mb-1">
                    {distText}
                  </div>
                  <div className="text-[10px] text-white/70">
                    Lat: {alert.latitude?.toFixed(4)}, Lon: {alert.longitude?.toFixed(4)}
                  </div>
               </div>
             );
          })}`;

file = file.replace(oldMarkup, newMarkup);
fs.writeFileSync('frontend/src/app/heatmap/page.tsx', file);
