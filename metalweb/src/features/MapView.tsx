// src/features/MapView.tsx
import { MapContainer, TileLayer } from 'react-leaflet';

export default function MapView() {
  return (
    <MapContainer center={[37.5665, 126.9780]} zoom={11} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}
