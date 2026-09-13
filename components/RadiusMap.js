'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function RadiusMap({
  latitude,
  longitude,
  targetLat,
  targetLng,
  targetRadius = 50,
  targetLabel = 'Alamat 1 (PKL)',
  homeLat,
  homeLng,
  homeRadius = 50,
  homeLabel = 'Alamat 2 (Alternatif)',
  isInside1 = false,
  isInside2 = false,
  locationText = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    userMarker: null,
    circle1: null,
    marker1: null,
    circle2: null,
    marker2: null
  });

  const isInsideAny = isInside1 || isInside2;

  useEffect(() => {
    if (!mapContainerRef.current || latitude === null || longitude === null) return;

    let isMounted = true;

    async function initOrUpdateMap() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      const uLat = Number(latitude);
      const uLng = Number(longitude);
      if (isNaN(uLat) || isNaN(uLng)) return;

      const tLat = targetLat !== undefined && targetLat !== null ? Number(targetLat) : null;
      const tLng = targetLng !== undefined && targetLng !== null ? Number(targetLng) : null;
      const tRad = Number(targetRadius) || 50;

      const hLat = homeLat !== undefined && homeLat !== null ? Number(homeLat) : null;
      const hLng = homeLng !== undefined && homeLng !== null ? Number(homeLng) : null;
      const hRad = Number(homeRadius) || 50;

      // Custom icon generators
      const createUserIcon = (isValid) => L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background-color: ${isValid ? '#10b981' : '#ef4444'}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: ${isValid ? '#059669' : '#dc2626'}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const createTargetIcon = (color, label) => L.divIcon({
        className: 'custom-target-marker',
        html: `
          <div style="background-color: ${color}; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: bold; border: 1.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); white-space: nowrap;">
            ${label}
          </div>
        `,
        iconSize: [60, 20],
        iconAnchor: [30, 24]
      });

      // Initialize map once if not created
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [uLat, uLng],
          zoom: 18,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: false,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const boundsPoints = [[uLat, uLng]];

      // 1. User Marker
      if (layersRef.current.userMarker) {
        layersRef.current.userMarker.setLatLng([uLat, uLng]);
        layersRef.current.userMarker.setIcon(createUserIcon(isInsideAny));
      } else {
        layersRef.current.userMarker = L.marker([uLat, uLng], {
          icon: createUserIcon(isInsideAny),
          zIndexOffset: 1000
        }).addTo(map);
        layersRef.current.userMarker.bindPopup(`<b>Lokasi Anda</b><br/>${isInsideAny ? '🟢 Dalam Radius' : '🔴 Di Luar Radius'}`);
      }

      // 2. Alamat 1 (PKL)
      if (tLat !== null && tLng !== null && !isNaN(tLat) && !isNaN(tLng)) {
        boundsPoints.push([tLat, tLng]);
        const color1 = isInside1 ? '#10b981' : '#2563eb';
        const fill1 = isInside1 ? '#10b981' : '#3b82f6';

        if (layersRef.current.circle1) {
          layersRef.current.circle1.setLatLng([tLat, tLng]);
          layersRef.current.circle1.setRadius(tRad);
          layersRef.current.circle1.setStyle({
            color: color1,
            fillColor: fill1,
            fillOpacity: isInside1 ? 0.35 : 0.2
          });
        } else {
          layersRef.current.circle1 = L.circle([tLat, tLng], {
            radius: tRad,
            color: color1,
            weight: 2,
            fillColor: fill1,
            fillOpacity: isInside1 ? 0.35 : 0.2
          }).addTo(map);
          layersRef.current.circle1.bindPopup(`<b>${targetLabel}</b><br/>Radius: ${tRad} meter`);
        }

        if (layersRef.current.marker1) {
          layersRef.current.marker1.setLatLng([tLat, tLng]);
          layersRef.current.marker1.setIcon(createTargetIcon(color1, 'PKL (1)'));
        } else {
          layersRef.current.marker1 = L.marker([tLat, tLng], {
            icon: createTargetIcon(color1, 'PKL (1)')
          }).addTo(map);
        }
      }

      // 3. Alamat 2 (Alternatif / Rumah)
      if (hLat !== null && hLng !== null && !isNaN(hLat) && !isNaN(hLng)) {
        boundsPoints.push([hLat, hLng]);
        const color2 = isInside2 ? '#10b981' : '#d97706';
        const fill2 = isInside2 ? '#10b981' : '#f59e0b';

        if (layersRef.current.circle2) {
          layersRef.current.circle2.setLatLng([hLat, hLng]);
          layersRef.current.circle2.setRadius(hRad);
          layersRef.current.circle2.setStyle({
            color: color2,
            fillColor: fill2,
            fillOpacity: isInside2 ? 0.35 : 0.2
          });
        } else {
          layersRef.current.circle2 = L.circle([hLat, hLng], {
            radius: hRad,
            color: color2,
            weight: 2,
            fillColor: fill2,
            fillOpacity: isInside2 ? 0.35 : 0.2
          }).addTo(map);
          layersRef.current.circle2.bindPopup(`<b>${homeLabel}</b><br/>Radius: ${hRad} meter`);
        }

        if (layersRef.current.marker2) {
          layersRef.current.marker2.setLatLng([hLat, hLng]);
          layersRef.current.marker2.setIcon(createTargetIcon(color2, 'Alternatif (2)'));
        } else {
          layersRef.current.marker2 = L.marker([hLat, hLng], {
            icon: createTargetIcon(color2, 'Alternatif (2)')
          }).addTo(map);
        }
      }

      // Smoothly fit bounds to active/nearest points
      if (isInside1 && tLat && tLng) {
        map.setView([tLat, tLng], 19);
      } else if (isInside2 && hLat && hLng) {
        map.setView([hLat, hLng], 19);
      } else if (boundsPoints.length > 1) {
        // Find closest target to user to fit nicely without zooming out worldwide
        let closestTarget = null;
        let minDiff = Infinity;
        if (tLat && tLng) {
          const diff = Math.hypot(uLat - tLat, uLng - tLng);
          if (diff < minDiff) { minDiff = diff; closestTarget = [tLat, tLng]; }
        }
        if (hLat && hLng) {
          const diff = Math.hypot(uLat - hLat, uLng - hLng);
          if (diff < minDiff) { minDiff = diff; closestTarget = [hLat, hLng]; }
        }

        if (closestTarget && minDiff < 0.05) { // If within ~5km, fit user + nearest target
          map.fitBounds([[uLat, uLng], closestTarget], { padding: [40, 40], maxZoom: 18 });
        } else {
          map.setView([uLat, uLng], 17);
        }
      } else {
        map.setView([uLat, uLng], 18);
      }
    }

    initOrUpdateMap();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, targetLat, targetLng, targetRadius, homeLat, homeLng, homeRadius, isInside1, isInside2, isInsideAny]);

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
      <div className="relative rounded-2xl overflow-hidden border border-[#DDDAD0] h-56 w-full shadow-sm bg-[#e8e6e1]">
        {/* Leaflet Map DOM container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Open Maps Button */}
        {latitude && longitude && (
          <a
            href={`https://maps.google.com/?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 z-[10] bg-white/95 hover:bg-white text-[#57564F] px-2.5 py-1 rounded-lg border border-[#DDDAD0] shadow-sm text-[10px] font-medium transition-all backdrop-blur-sm flex items-center gap-1 cursor-pointer"
          >
            Google Maps ↗
          </a>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-2.5 left-2.5 z-[10] bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-[#DDDAD0] shadow-sm flex items-center gap-3 text-[10px] text-[#57564F] select-none">
          <div className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isInsideAny ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span>Anda</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Alamat 1</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Alamat 2</span>
          </div>
        </div>
      </div>

      {/* Coordinate and address info */}
      <div className="space-y-1 pt-0.5">
        <div className="flex justify-between text-[#7A7A73] font-normal text-[11px]">
          <span>Latitude: <strong className="text-[#57564F] font-mono">{Number(latitude)?.toFixed(6)}</strong></span>
          <span>Longitude: <strong className="text-[#57564F] font-mono">{Number(longitude)?.toFixed(6)}</strong></span>
        </div>
        {locationText && (
          <p className="text-[11px] text-[#57564F] font-normal leading-relaxed truncate" title={locationText}>
            📍 {locationText}
          </p>
        )}
      </div>
    </div>
  );
}
