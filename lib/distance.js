/**
 * Menghitung jarak geografis antara dua koordinat menggunakan Haversine Formula (dalam meter).
 * @param {number|string} lat1 Latitude titik 1
 * @param {number|string} lon1 Longitude titik 1
 * @param {number|string} lat2 Latitude titik 2
 * @param {number|string} lon2 Longitude titik 2
 * @returns {number|null} Jarak dalam meter, atau null jika koordinat tidak valid
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371e3; // Radius bumi dalam meter (rata-rata 6.371 km)
  const phi1 = (nLat1 * Math.PI) / 180;
  const phi2 = (nLat2 * Math.PI) / 180;
  const deltaPhi = ((nLat2 - nLat1) * Math.PI) / 180;
  const deltaLambda = ((nLon2 - nLon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Dalam meter bulat
}

/**
 * Format jarak ke format teks yang ramah pengguna.
 * Contoh: 45 meter atau 1.25 km (1.250 meter)
 * @param {number|null} meters 
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return 'Belum terdeteksi';
  if (meters < 1000) {
    return `${meters} meter`;
  }
  const km = (meters / 1000).toFixed(2);
  return `${km} km (${meters.toLocaleString('id-ID')} m)`;
}
