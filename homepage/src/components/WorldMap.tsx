
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WorldMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const networkNodes = [
    { name: 'North America', lat: 40.7128, lng: -74.0060, nodes: 12, status: 'active' },
    { name: 'Europe', lat: 51.5074, lng: -0.1278, nodes: 18, status: 'active' },
    { name: 'Asia Pacific', lat: 35.6762, lng: 139.6503, nodes: 24, status: 'active' },
    { name: 'South America', lat: -23.5505, lng: -46.6333, nodes: 8, status: 'expanding' },
    { name: 'Africa', lat: -26.2041, lng: 28.0473, nodes: 6, status: 'developing' },
    { name: 'Oceania', lat: -33.8688, lng: 151.2093, nodes: 4, status: 'planned' }
  ];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    });

    mapInstanceRef.current = map;

    // Add dark tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'map-tiles'
    }).addTo(map);

    // Add network nodes
    networkNodes.forEach((node) => {
      const color = node.status === 'active' ? '#ffd700' : 
                   node.status === 'expanding' ? '#00bfff' : '#00bfff80';
      
      const circle = L.circleMarker([node.lat, node.lng], {
        radius: 8 + (node.nodes / 3),
        fillColor: color,
        color: '#00bfff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6
      }).addTo(map);

      circle.bindPopup(`
        <div style="background: #0a0a0a; color: #00bfff; padding: 8px; border: 1px solid #00bfff; font-family: monospace;">
          <strong style="color: #ffd700;">${node.name}</strong><br/>
          Nodes: ${node.nodes}<br/>
          Status: ${node.status.toUpperCase()}
        </div>
      `);
    });

    // Add connection lines
    for (let i = 0; i < networkNodes.length - 1; i++) {
      const start = networkNodes[i];
      const end = networkNodes[i + 1];
      
      L.polyline([
        [start.lat, start.lng],
        [end.lat, end.lng]
      ], {
        color: '#00bfff',
        weight: 1,
        opacity: 0.4,
        dashArray: '5, 10'
      }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded border border-cyber-blue/30"
        style={{
          filter: 'hue-rotate(200deg) saturate(0.7) brightness(0.8)',
          background: '#0a0a0a'
        }}
      />
      <div className="absolute inset-0 pointer-events-none border border-cyber-blue/50 rounded" />
    </div>
  );
};

export default WorldMap;
