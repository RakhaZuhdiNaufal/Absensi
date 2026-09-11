'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function RadiusMap({ latitude, longitude, radius = 10, locationText = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || latitude === null || longitude === null) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      // If map is already initialized, just update center and circle
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 20);

        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng]);
          circleRef.current.setRadius(radius);
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        return;
      }

      // Create new map
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 20,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // High-resolution, clean modern map tile layer (neutral clean roads, crisp labels, no garish red/yellow, no apikey watermark)
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: false,
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Simple clean circular radius (buletan polos)
      const circle = L.circle([lat, lng], {
        radius: radius,
        stroke: false,
        fillColor: '#2563eb',
        fillOpacity: 0.22,
      }).addTo(map);

      circleRef.current = circle;

      // Simple clean center point
      const customIcon = L.divIcon({
        className: 'custom-radius-marker',
        html: `
          <div style="width: 12px; height: 12px; border-radius: 9999px; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.35);"></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Fit circle nicely in viewport with maxZoom 20 so 10m radius is clearly visible
      map.fitBounds(circle.getBounds(), { padding: [20, 20], maxZoom: 20 });
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, radius]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2 text-xs">
      <div className="relative rounded-2xl overflow-hidden border border-[#DDDAD0] h-52 w-full shadow-sm bg-[#e8e6e1]">
        {/* Leaflet Map DOM container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Open Maps Button */}
        {latitude && longitude && (
          <a
            href={`https://maps.google.com/?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 z-[10] bg-white/95 hover:bg-white text-[#57564F] px-2.5 py-1 rounded-lg border border-[#DDDAD0] shadow-sm text-[10px] font-medium transition-all backdrop-blur-sm"
          >
            Google Maps ↗
          </a>
        )}
      </div>

      {/* Coordinate and address info */}
      <div className="space-y-0.5 pt-0.5">
        <div className="flex justify-between text-[#7A7A73] font-normal text-xs">
          <span>Latitude: <strong className="text-[#57564F] font-normal">{Number(latitude)?.toFixed(6)}</strong></span>
          <span>Longitude: <strong className="text-[#57564F] font-normal">{Number(longitude)?.toFixed(6)}</strong></span>
        </div>
        <p className="text-[11px] text-[#57564F] font-normal leading-relaxed truncate" title={locationText}>
          {locationText}
        </p>
      </div>
    </div>
  );
}
