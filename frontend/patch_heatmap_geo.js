const fs = require('fs');
let file = fs.readFileSync('src/app/heatmap/page.tsx', 'utf8');

const oldWsOnOpen = `    ws.onopen = () => {
      // Node B: ~0.5km away
      // Node C: ~5km away
      const latOffset = simRole === 'B' ? 0.005 : 0.045;
      
      const loc = { 
        type: "REGISTER_LOCATION", 
        latitude: BASE_LAT + latOffset, 
        longitude: BASE_LON 
      };
      ws.send(JSON.stringify(loc));
    };`;

const newWsOnOpen = `    ws.onopen = () => {
      const latOffset = simRole === 'B' ? 0.005 : 0.045;
      
      const sendLocation = (lat: number, lon: number) => {
        ws.send(JSON.stringify({
          type: "REGISTER_LOCATION",
          latitude: lat + latOffset,
          longitude: lon
        }));
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => sendLocation(position.coords.latitude, position.coords.longitude),
          (error) => sendLocation(BASE_LAT, BASE_LON)
        );
      } else {
        sendLocation(BASE_LAT, BASE_LON);
      }
    };`;

file = file.replace(oldWsOnOpen, newWsOnOpen);
fs.writeFileSync('src/app/heatmap/page.tsx', file);
