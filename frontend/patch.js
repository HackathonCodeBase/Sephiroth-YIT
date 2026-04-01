const fs = require('fs');
const content = fs.readFileSync('../frontend/src/components/DiagnosticReport.tsx', 'utf8');
const search = '      <div className="relative z-10 flex flex-col space-y-6">';
const replace = `      {isHealthy === false && (
         <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-3xl flex items-start gap-4 animate-pulse relative z-10 mx-auto">
            <div className="bg-rose-500 rounded-full p-2 text-white shrink-0 mt-1">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-rose-800 uppercase tracking-widest text-xs mb-1">
                Disease Pattern Broadcasted
              </h4>
              <p className="text-rose-600/80 text-[11px] font-medium leading-relaxed">
                We've alerted nearby nodes on the <b>Global Heatmap</b> about this {" "}
                <span className="underline decoration-rose-400 decoration-2 font-bold">{results?.disease?.replace(/_/g, ' ')}</span> {" "}
                outbreak. Review the remediation plan below.
              </p>
            </div>
         </div>
       )}
      <div className="relative z-10 flex flex-col space-y-6">`;
fs.writeFileSync('../frontend/src/components/DiagnosticReport.tsx', content.replace(search, replace));
