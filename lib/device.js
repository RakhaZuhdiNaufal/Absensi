
export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { deviceId: '', deviceName: 'Memuat perangkat...' };
  }

  try {
    let deviceId = localStorage.getItem('pkl_device_id');
    if (!deviceId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        deviceId = 'DEV-' + crypto.randomUUID();
      } else {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
      }
      localStorage.setItem('pkl_device_id', deviceId);
    }

    const ua = navigator.userAgent || '';
    const isMobile = /android|iphone|ipad|ipod|windows phone|blackberry|mobile/i.test(ua);
    const deviceType = isMobile ? 'mobile' : 'web';

    let os = 'Perangkat';
    if (/android/i.test(ua)) os = 'Android';
    else if (/iphone/i.test(ua)) os = 'iPhone';
    else if (/ipad/i.test(ua)) os = 'iPad';
    else if (/windows phone/i.test(ua)) os = 'Windows Phone';
    else if (/win/i.test(ua)) os = 'Windows';
    else if (/mac/i.test(ua)) os = 'Mac';
    else if (/linux/i.test(ua)) os = 'Linux';

    let browser = 'Browser';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';

    const deviceName = `${os} (${browser})`;
    return { deviceId, deviceType, deviceName };
  } catch (err) {
    return { deviceId: 'DEV-BROWSER', deviceType: 'web', deviceName: 'Browser Default' };
  }
}

export function resetLocalDeviceId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pkl_device_id');
    return getDeviceInfo();
  }
  return { deviceId: '', deviceType: 'web', deviceName: '' };
}
