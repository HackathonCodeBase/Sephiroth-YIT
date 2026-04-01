const fs = require('fs');
let file = fs.readFileSync('src/app/heatmap/page.tsx', 'utf8');
file = file.replace('backendStatus={ cat src/app/heatmap/page.tsxbackendStatus}', 'backendStatus={!!backendStatus}');
fs.writeFileSync('src/app/heatmap/page.tsx', file);
