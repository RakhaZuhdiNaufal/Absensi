'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function RadiusMap({
  latitude,
  longitude,
  targetLat,
  targetLng,
  targetRadius = 50,
  targetLabel = 'WFO',
  homeLat,
  homeLng,
  homeRadius = 50,
  homeLabel = 'Rumah',
  schoolLat = -6.384288,
  schoolLng = 106.869938,
  schoolRadius = 50,
  schoolLabel = 'Sekolah',
  isInside1 = false,
  isInside2 = false,
  isInsideSchool = false,
  locationText = '',
  workMode = 'wfo',
  showHome = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    userMarker: null,
    userCircle: null,
    circle1: null,
    marker1: null,
    circle2: null,
    marker2: null,
    circle3: null,
    marker3: null
  });

  const isWfh = workMode === 'wfh' || showHome === true;
  const isInsideActive = isWfh ? (isInside2 || isInsideSchool) : isInside1;

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

      const sLat = schoolLat !== undefined && schoolLat !== null ? Number(schoolLat) : -6.384288;
      const sLng = schoolLng !== undefined && schoolLng !== null ? Number(schoolLng) : 106.869938;
      const sRad = Number(schoolRadius) || 50;

      // Custom icon generators
      const createUserIcon = () => L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 13px; height: 13px; border-radius: 9999px; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const createTargetIcon = (label) => L.divIcon({
        className: 'custom-target-marker',
        html: `
          <div style="background-color: #57564F; color: #ffffff; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; border: 1px solid rgba(255,255,255,0.7); box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap;">
            ${label}
          </div>
        `,
        iconSize: [50, 18],
        iconAnchor: [25, 22]
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

      // Clean up extra userCircle if previously created
      if (layersRef.current.userCircle) {
        map.removeLayer(layersRef.current.userCircle);
        layersRef.current.userCircle = null;
      }

      // 1. User Marker (Titik Biru Bersih)
      if (layersRef.current.userMarker) {
        layersRef.current.userMarker.setLatLng([uLat, uLng]);
        layersRef.current.userMarker.setIcon(createUserIcon());
      } else {
        layersRef.current.userMarker = L.marker([uLat, uLng], {
          icon: createUserIcon(),
          zIndexOffset: 1000
        }).addTo(map);
        layersRef.current.userMarker.bindPopup(`<b>Lokasi Anda</b><br/>${Number(uLat).toFixed(6)}, ${Number(uLng).toFixed(6)}`);
      }

      // 2. Lokasi WFO (PT Naikmarketing) - Tampil saat mode WFO
      if (!isWfh && tLat !== null && tLng !== null && !isNaN(tLat) && !isNaN(tLng)) {
        boundsPoints.push([tLat, tLng]);

        if (layersRef.current.circle1) {
          layersRef.current.circle1.setLatLng([tLat, tLng]);
          layersRef.current.circle1.setRadius(tRad);
        } else {
          layersRef.current.circle1 = L.circle([tLat, tLng], {
            radius: tRad,
            stroke: false,
            fillColor: '#2563eb',
            fillOpacity: 0.18,
          }).addTo(map);
          layersRef.current.circle1.bindPopup(`<b>${targetLabel}</b><br/>Radius: ${tRad} meter`);
        }

        if (layersRef.current.marker1) {
          layersRef.current.marker1.setLatLng([tLat, tLng]);
          layersRef.current.marker1.setIcon(createTargetIcon(targetLabel || 'WFO'));
        } else {
          layersRef.current.marker1 = L.marker([tLat, tLng], {
            icon: createTargetIcon(targetLabel || 'WFO')
          }).addTo(map);
        }
      } else {
        if (layersRef.current.circle1) {
          map.removeLayer(layersRef.current.circle1);
          layersRef.current.circle1 = null;
        }
        if (layersRef.current.marker1) {
          map.removeLayer(layersRef.current.marker1);
          layersRef.current.marker1 = null;
        }
      }

      // 3. Lokasi WFH 1 (Rumah) - Tampil saat mode WFH
      if (isWfh && hLat !== null && hLng !== null && !isNaN(hLat) && !isNaN(hLng)) {
        boundsPoints.push([hLat, hLng]);

        if (layersRef.current.circle2) {
          layersRef.current.circle2.setLatLng([hLat, hLng]);
          layersRef.current.circle2.setRadius(hRad);
        } else {
          layersRef.current.circle2 = L.circle([hLat, hLng], {
            radius: hRad,
            stroke: false,
            fillColor: '#2563eb',
            fillOpacity: 0.18,
          }).addTo(map);
          layersRef.current.circle2.bindPopup(`<b>${homeLabel}</b><br/>Radius: ${hRad} meter`);
        }

        if (layersRef.current.marker2) {
          layersRef.current.marker2.setLatLng([hLat, hLng]);
          layersRef.current.marker2.setIcon(createTargetIcon(homeLabel || 'Rumah'));
        } else {
          layersRef.current.marker2 = L.marker([hLat, hLng], {
            icon: createTargetIcon(homeLabel || 'Rumah')
          }).addTo(map);
        }
      } else {
        if (layersRef.current.circle2) {
          map.removeLayer(layersRef.current.circle2);
          layersRef.current.circle2 = null;
        }
        if (layersRef.current.marker2) {
          map.removeLayer(layersRef.current.marker2);
          layersRef.current.marker2 = null;
        }
      }

      // 4. Lokasi WFH 2 (Sekolah: SMK Taruna Bhakti) - Tampil saat mode WFH
      if (isWfh && sLat !== null && sLng !== null && !isNaN(sLat) && !isNaN(sLng)) {
        boundsPoints.push([sLat, sLng]);

        if (layersRef.current.circle3) {
          layersRef.current.circle3.setLatLng([sLat, sLng]);
          layersRef.current.circle3.setRadius(sRad);
        } else {
          layersRef.current.circle3 = L.circle([sLat, sLng], {
            radius: sRad,
            stroke: false,
            fillColor: '#2563eb',
            fillOpacity: 0.18,
          }).addTo(map);
          layersRef.current.circle3.bindPopup(`<b>${schoolLabel}</b><br/>Radius: ${sRad} meter`);
        }

        if (layersRef.current.marker3) {
          layersRef.current.marker3.setLatLng([sLat, sLng]);
          layersRef.current.marker3.setIcon(createTargetIcon(schoolLabel || 'Sekolah'));
        } else {
          layersRef.current.marker3 = L.marker([sLat, sLng], {
            icon: createTargetIcon(schoolLabel || 'Sekolah')
          }).addTo(map);
        }
      } else {
        if (layersRef.current.circle3) {
          map.removeLayer(layersRef.current.circle3);
          layersRef.current.circle3 = null;
        }
        if (layersRef.current.marker3) {
          map.removeLayer(layersRef.current.marker3);
          layersRef.current.marker3 = null;
        }
      }

      // Smoothly fit bounds to active point
      if (isWfh) {
        if (isInside2 && hLat && hLng) {
          map.setView([hLat, hLng], 19);
        } else if (isInsideSchool && sLat && sLng) {
          map.setView([sLat, sLng], 19);
        } else {
          // Cari target WFH terdekat (Rumah atau Sekolah)
          let closest = [sLat, sLng];
          let minD = Math.hypot(uLat - sLat, uLng - sLng);
          if (hLat && hLng) {
            const dHome = Math.hypot(uLat - hLat, uLng - hLng);
            if (dHome < minD) {
              minD = dHome;
              closest = [hLat, hLng];
            }
          }
          if (minD < 0.05) {
            map.fitBounds([[uLat, uLng], closest], { padding: [40, 40], maxZoom: 18 });
          } else {
            map.setView([uLat, uLng], 17);
          }
        }
      } else {
        if (isInside1 && tLat && tLng) {
          map.setView([tLat, tLng], 19);
        } else if (tLat && tLng && Math.hypot(uLat - tLat, uLng - tLng) < 0.05) {
          map.fitBounds([[uLat, uLng], [tLat, tLng]], { padding: [40, 40], maxZoom: 18 });
        } else {
          map.setView([uLat, uLng], 17);
        }
      }
    }

    initOrUpdateMap();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, targetLat, targetLng, targetRadius, targetLabel, homeLat, homeLng, homeRadius, homeLabel, schoolLat, schoolLng, schoolRadius, schoolLabel, isInside1, isInside2, isInsideSchool, isInsideActive, workMode, showHome, isWfh]);

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
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Anda</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]/40"></span>
            <span>Radius</span>
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
            {locationText}
          </p>
        )}
      </div>
    </div>
  );
}
