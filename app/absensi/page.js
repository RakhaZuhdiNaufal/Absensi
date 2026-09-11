'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import BottomNav from '@/components/BottomNav';
import TopNavbar from '@/components/TopNavbar';
import {
  Camera,
  RefreshCw,
  Check,
  Clock,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { getDeviceInfo } from '@/lib/device';

const RadiusMap = dynamic(() => import('@/components/RadiusMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[#DDDAD0] h-48 w-full bg-[#f9f8f3] flex flex-col items-center justify-center gap-2">
      <div className="w-5 h-5 border-2 border-[#57564F] border-t-transparent rounded-full animate-spin" />
      <span className="text-[11px] text-[#7A7A73]">Memuat peta radius 10 meter...</span>
    </div>
  )
});

export default function AbsensiPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [hasAttended, setHasAttended] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deviceInfo, setDeviceInfo] = useState({ deviceId: '', deviceName: '' });

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isPhotoConfirmed, setIsPhotoConfirmed] = useState(false);

  const [locationState, setLocationState] = useState({
    loading: true,
    latitude: null,
    longitude: null,
    locationText: '',
    error: ''
  });

  const [status, setStatus] = useState('hadir');
  const [workMode, setWorkMode] = useState('wfo');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [pdfName, setPdfName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');
  const [submitErrorMsg, setSubmitErrorMsg] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    initPageData();
    return () => {
      stopCamera();
    };
  }, []);

  const initPageData = async () => {
    try {

      const dev = getDeviceInfo();
      setDeviceInfo(dev);

      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success) {
        router.push('/login');
        return;
      }
      setUser(meData.user);
      setStudent(meData.student);

      const attRes = await fetch('/api/attendance/today');
      const attData = await attRes.json();
      if (attData.success && attData.hasAttended) {
        setHasAttended(true);
        setExistingAttendance(attData.attendance);
      } else {
        requestLocation();
        startCamera();
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('Play error:', e));
    }
  }, [stream, isCameraActive]);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      let mediaStream;
      try {

        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false
        });
      } catch (err1) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        } catch (err2) {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
      }

      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera Access Error:', err);
      setCameraError('Kamera tidak dapat diakses langsung. Anda juga dapat memilih foto dari Kamera HP.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    setIsPhotoConfirmed(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedPhoto(event.target.result);
      setIsPhotoConfirmed(false);
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsPhotoConfirmed(false);
    if (!isCameraActive) {
      startCamera();
    }
  };

  const confirmPhoto = () => {
    setIsPhotoConfirmed(true);
    stopCamera();
  };

  const requestLocation = () => {
    setLocationState(prev => ({ ...prev, loading: true, error: '' }));

    if (!navigator.geolocation) {
      setLocationState({
        loading: false,
        latitude: null,
        longitude: null,
        locationText: '',
        error: 'Geolokasi tidak didukung oleh browser Anda.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let locName = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData && revData.display_name) {
              locName = revData.display_name;
            }
          }
        } catch (e) {}

        setLocationState({
          loading: false,
          latitude: lat,
          longitude: lng,
          locationText: locName,
          error: ''
        });
      },
      (err) => {
        let msg = 'Izin lokasi ditolak. Lokasi diperlukan untuk melakukan absensi.';
        if (err.code === err.POSITION_UNAVAILABLE) msg = 'Informasi lokasi tidak tersedia pada perangkat.';
        if (err.code === err.TIMEOUT) msg = 'Waktu pengambilan lokasi habis. Silakan coba lagi.';

        setLocationState({
          loading: false,
          latitude: null,
          longitude: null,
          locationText: '',
          error: msg
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setSubmitErrorMsg('');
    setSubmitSuccessMsg('');

    if (!capturedPhoto || !isPhotoConfirmed) {
      setSubmitErrorMsg('Foto bukti kehadiran belum disetujui. Ambil dan gunakan foto terlebih dahulu.');
      return;
    }

    if (!locationState.latitude || !locationState.longitude) {
      setSubmitErrorMsg('Lokasi diperlukan untuk melakukan absensi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: capturedPhoto,
          latitude: locationState.latitude,
          longitude: locationState.longitude,
          location: locationState.locationText,
          reason,
          note,
          status,
          work_mode: status === 'hadir' ? workMode : null,
          device_id: deviceInfo.deviceId,
          device_name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitErrorMsg(data.message || 'Gagal mengirim absensi.');
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccessMsg('Absensi berhasil disimpan! Terima kasih.');
      setHasAttended(true);
      setExistingAttendance(data.attendance);
      setIsSubmitting(false);
      stopCamera();
    } catch (err) {
      setSubmitErrorMsg('Terjadi kesalahan jaringan.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24">
        <TopNavbar />
        <div className="max-w-xl mx-auto p-8 flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7A7A73]">Memuat...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-8">
      <TopNavbar />

      <div className="md:ml-64">

        <div className="w-full bg-white text-[#57564F] px-4 md:px-8 py-4 border-b border-[#DDDAD0] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-[#7A7A73] block font-medium">{currentDate}</span>
            <div className="text-xl font-normal text-[#57564F] mt-0.5">
              {currentTime}
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-[#7A7A73] block font-medium pb-1 border-b border-[#DDDAD0]">Status Absensi</span>
            {hasAttended && existingAttendance ? (
              <span className="text-xs text-[#57564F] block pt-1 font-normal capitalize">
                {existingAttendance.status} {existingAttendance.work_mode ? `(${existingAttendance.work_mode.toUpperCase()})` : ''}
              </span>
            ) : (
              <span className="text-xs text-[#7A7A73] block pt-1 font-normal">
                Belum Presensi
              </span>
            )}
          </div>
        </div>

        <div className="max-w-xl mx-auto md:max-w-none p-4 md:p-6 md:pr-8 space-y-4">
          {hasAttended && existingAttendance && (
            <div className="bg-white border border-[#DDDAD0] rounded-3xl p-6 text-center shadow-sm">
              <h2 className="text-base font-bold text-[#57564F] mb-4">Kamu sudah melakukan absensi hari ini.</h2>

              <div className="bg-[#f9f8f3] rounded-2xl p-4 border border-[#DDDAD0] text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Waktu Absensi:</span>
                  <span className="font-normal text-[#57564F]">{existingAttendance.attendance_time} WIB</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[#7A7A73]">Lokasi:</span>
                  <span className="font-normal text-[#57564F] text-right max-w-[280px] truncate" title={existingAttendance.location}>{existingAttendance.location}</span>
                </div>
              </div>

            </div>
          )}

          {!hasAttended && (
            <form onSubmit={handleSubmitAttendance} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] flex flex-col justify-between">
                  <canvas ref={canvasRef} className="hidden" />

                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-[#DDDAD0] shadow-inner flex items-center justify-center">
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="Hasil Swafoto" className="w-full h-full object-cover" />
                    ) : isCameraActive ? (
                      <video
                        ref={(node) => {
                          videoRef.current = node;
                          if (node && stream) {
                            if (node.srcObject !== stream) {
                              node.srcObject = stream;
                            }
                            node.play().catch(e => console.warn('Play error:', e));
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="p-4 text-[#7A7A73] flex flex-col items-center gap-2">
                        <Camera className="w-12 h-12 stroke-1 text-[#DDDAD0]" />
                        <p className="text-xs max-w-xs text-center text-[#7A7A73]">{cameraError || 'Kamera belum aktif. Klik tombol di bawah untuk mengaktifkan kamera atau pilih foto dari HP.'}</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="mt-2 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          Aktifkan Kamera Live
                        </button>
                      </div>
                    )}

                  </div>

                  <div className="mt-4 pt-4 border-t border-[#DDDAD0]">
                    {!capturedPhoto ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isCameraActive) {
                            capturePhoto();
                          } else {
                            startCamera();
                          }
                        }}
                        className="w-full bg-[#57564F] hover:bg-[#474640] active:scale-95 text-[#F8F3CE] font-bold py-3 px-4 rounded-xl shadow-sm text-xs transition-all text-center"
                      >
                        Foto
                      </button>
                    ) : (
                      <div className="flex gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={retakePhoto}
                          className="flex-1 bg-[#f9f8f3] hover:bg-[#DDDAD0]/40 active:scale-95 text-[#57564F] font-bold py-3 rounded-xl border border-[#DDDAD0] text-xs flex items-center justify-center transition-all"
                        >
                          Ambil Ulang
                        </button>
                        {!isPhotoConfirmed ? (
                          <button
                            type="button"
                            onClick={confirmPhoto}
                            className="flex-1 bg-[#57564F] hover:bg-[#474640] active:scale-95 text-[#F8F3CE] font-bold py-3 rounded-xl shadow-sm text-xs flex items-center justify-center transition-all"
                          >
                            Gunakan Foto
                          </button>
                        ) : (
                          <span className="flex-1 bg-[#57564F] text-[#F8F3CE] font-bold py-3 rounded-xl border border-[#57564F] text-xs flex items-center justify-center shadow-sm">
                            Foto Disetujui
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] space-y-4 h-fit">

                  <div className="space-y-2 pb-3 border-b border-[#DDDAD0]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-normal text-[#57564F]">
                        Lokasi
                      </h3>
                      <button
                        type="button"
                        onClick={requestLocation}
                        className="text-xs text-[#57564F] font-normal hover:underline"
                      >
                        Refresh
                      </button>
                    </div>

                    {locationState.loading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-xs text-[#7A7A73]">
                        <div className="w-5 h-5 border-2 border-[#57564F] border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Mengambil koordinat lokasi akurat...</span>
                      </div>
                    ) : locationState.error ? (
                      <div className="py-6 text-[#57564F] text-xs text-center">
                        <span className="font-normal block">Lokasi Diperlukan: {locationState.error}</span>
                        <button
                          type="button"
                          onClick={requestLocation}
                          className="mt-2 text-xs font-bold underline text-[#57564F]"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : (
                      <RadiusMap
                        latitude={locationState.latitude}
                        longitude={locationState.longitude}
                        radius={10}
                        locationText={locationState.locationText}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-center text-xs font-normal text-[#57564F] mb-1.5">Status Kehadiran</label>
                    <div className="relative bg-[#f4f2eb] p-1 rounded-2xl border border-[#DDDAD0] flex select-none">
                      {/* Smooth sliding pill indicator */}
                      <div
                        className="absolute top-1 bottom-1 rounded-xl bg-[#57564F] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{
                          width: 'calc((100% - 8px) / 3)',
                          left: '4px',
                          transform: `translateX(${(status === 'izin' ? 1 : status === 'sakit' ? 2 : 0) * 100}%)`,
                        }}
                      />
                      {[
                        { id: 'hadir', label: 'Hadir' },
                        { id: 'izin', label: 'Izin' },
                        { id: 'sakit', label: 'Sakit' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStatus(item.id)}
                          className={`relative z-10 flex-1 py-2 text-xs font-medium text-center rounded-xl transition-colors duration-200 cursor-pointer select-none ${
                            status === item.id ? 'text-[#F8F3CE]' : 'text-[#7A7A73] hover:text-[#57564F]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Smooth Collapsible WFO / WFH Selector */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        status === 'hadir'
                          ? 'max-h-28 opacity-100 pt-3 mt-3 border-t border-[#DDDAD0]'
                          : 'max-h-0 opacity-0 pt-0 mt-0 border-t-0 pointer-events-none'
                      }`}
                    >
                      <div className="relative bg-[#f4f2eb] p-1 rounded-2xl border border-[#DDDAD0] flex select-none max-w-[260px] mx-auto">
                        <div
                          className="absolute top-1 bottom-1 rounded-xl bg-[#57564F] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                          style={{
                            width: 'calc((100% - 8px) / 2)',
                            left: '4px',
                            transform: `translateX(${workMode === 'wfh' ? 100 : 0}%)`,
                          }}
                        />
                        {[
                          { id: 'wfo', label: 'WFO' },
                          { id: 'wfh', label: 'WFH' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            title={item.id === 'wfo' ? 'Work From Office' : 'Work From Home'}
                            onClick={() => setWorkMode(item.id)}
                            className={`relative z-10 flex-1 py-2 text-xs font-medium text-center rounded-xl transition-colors duration-200 cursor-pointer select-none ${
                              workMode === item.id ? 'text-[#F8F3CE]' : 'text-[#7A7A73] hover:text-[#57564F]'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Smooth Collapsible Izin / Sakit Details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      status !== 'hadir'
                        ? 'max-h-[500px] opacity-100 pt-3 mt-3 border-t border-[#DDDAD0] space-y-4'
                        : 'max-h-0 opacity-0 pt-0 mt-0 border-t-0 pointer-events-none'
                    }`}
                  >
                    <div>
                      <label className="block text-xs font-normal text-[#57564F] mb-1">
                        {status === 'izin' ? 'Alasan Izin' : 'Alasan Sakit'}
                      </label>
                      <input
                        type="text"
                        required={status !== 'hadir'}
                        placeholder={status === 'izin' ? 'Tuliskan alasan izin...' : 'Tuliskan alasan sakit...'}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-[#57564F] mb-1">
                        {status === 'izin' ? 'Surat Izin (PDF)' : 'Surat Keterangan Dokter (PDF)'}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPdfName(file.name);
                          }
                        }}
                        className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-1.5 text-xs text-[#57564F] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#57564F] file:text-[#F8F3CE] hover:file:bg-[#474640] transition-colors duration-200"
                      />
                      {pdfName && (
                        <p className="text-[11px] text-[#57564F] mt-1 flex items-center gap-1 font-normal">
                          📄 Surat terpilih: {pdfName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-normal text-[#57564F] mb-1">Catatan Tambahan</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] transition-colors duration-200"
                    />
                  </div>

                  {submitErrorMsg && (
                    <div className="p-3 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-[#57564F] text-xs font-semibold">
                      {submitErrorMsg}
                    </div>
                  )}

                  {submitSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                      ✅ {submitSuccessMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !isPhotoConfirmed || !locationState.latitude}
                    className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs cursor-pointer select-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#DDDAD0] border-t-[#F8F3CE] rounded-full animate-spin" />
                        <span>Menyimpan Presensi...</span>
                      </>
                    ) : (
                      <span>Absen Sekarang</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
