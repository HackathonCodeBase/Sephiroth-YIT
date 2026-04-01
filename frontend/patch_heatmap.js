const fs = require('fs');
let file = fs.readFileSync('src/app/heatmap/page.tsx', 'utf8');

// Adding simulatedNode logic
// Let's first add a state for it
file = file.replace(
  'const [alerts, setAlerts] = useState<any[]>([]);',
  'const [alerts, setAlerts] = useState<any[]>([]);\n  const [simNode, setSimNode] = useState<string>("B"); // A=Upload, B=In 2km, C=Out 2km'
);

// We need to pass simNode to connectWebSocket, but hook dependencies could be messy. 
// Instead we'll dynamically use the state inside the effect or re-run effect when simNode changes.
// It's probably easier to just have the connection update location whenever simNode changes.

// Let's rewrite the connectWebSocket block and the useEffect to depend on simNode.
