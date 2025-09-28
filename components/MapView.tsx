
'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Detection } from '../lib/types';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Fix for SSR - prevent window access during server rendering
if (typeof window !== 'undefined') {
  // Fix for default markers in react-leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Create different marker icons based on confidence
const createMarkerIcon = (confidence: number) => {
  const color = confidence >= 90 ? '#FF6A00' : confidence >= 70 ? '#FFA500' : '#FFD700';
  const size = confidence >= 90 ? '12px' : confidence >= 70 ? '10px' : '8px';
  
  return new L.DivIcon({ 
    className: 'custom-marker', 
    html: `<div style="background:${color};width:${size};height:${size};border-radius:50%;box-shadow:0 0 12px ${color};"></div>` 
  });
};

// Component to fit map bounds to all detections
function MapBounds({ detections }: { detections: Detection[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (detections.length > 0) {
      const bounds = L.latLngBounds(detections.map(d => [d.lat, d.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [detections, map]);
  
  return null;
}

export default function MapView({ detections }: { detections: Detection[] }){
  const [mapCenter] = useState<[number, number]>([37.2296, -80.4139]);
  const positions = detections.map(d=> [d.lat, d.lng]) as [number,number][];
  
  return (
    <div className="h-[520px] rounded-lg overflow-hidden border border-slate-800 relative">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }} 
        aria-label="Geospatial suspect map"
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds detections={detections} />
        
        {positions.length > 0 && (
          <Polyline 
            positions={positions} 
            pathOptions={{ 
              color: '#1E90FF', 
              weight: 4,
              opacity: 0.8,
              dashArray: '5, 5'
            }}
          />
        )} 
        
        {detections.map((d)=> (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={createMarkerIcon(d.confidence)}>
            <Popup className="custom-popup">
              <div className="text-sm min-w-[200px]">
                <div className="font-medium text-slate-200 mb-2">Suspect Detection</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className={`font-medium ${
                      d.confidence >= 90 ? 'text-green-400' : 
                      d.confidence >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {d.confidence}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-slate-200">{d.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Camera:</span>
                    <span className="text-slate-200">{d.camera}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-200 text-xs">{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {detections.length > 0 && (
          <Circle 
            center={positions[positions.length-1]} 
            radius={250} 
            pathOptions={{
              color: '#1E90FF',
              fillColor: '#1E90FF',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
        )}
      </MapContainer>
      
      {/* Map overlay with detection count */}
      <div className="absolute top-4 right-4 bg-aegis-card/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-sm">
        <div className="text-slate-200 font-medium">{detections.length} Detection{detections.length !== 1 ? 's' : ''}</div>
        <div className="text-slate-400 text-xs">Last seen: {detections[0]?.time || 'N/A'}</div>
      </div>
    </div>
  )
}
