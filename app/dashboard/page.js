'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import TopNavbar from '@/components/TopNavbar';
import {
  Camera,
  Calendar,
  History,
  ChevronRight,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

export default function SiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success) {
        router.push('/login');
        return;
      }
      setUser(meData.user);
      setStudent(meData.student);

      const [attRes, actRes, histRes] = await Promise.all([
        fetch('/api/attendance/today'),
        fetch('/api/activities'),
        fetch('/api/attendance/history')
      ]);

      const [attData, actData, histData] = await Promise.all([
        attRes.json(),
        actRes.json(),
        histRes.json()
      ]);

      if (attData.success) setTodayAttendance(attData.attendance);
      if (actData.success) setActivities(actData.activities || []);
      if (histData.success) setHistory(histData.history || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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

  const totalHadir = history.filter(h => h.status === 'hadir').length;
  const totalIzinSakit = history.filter(h => h.status === 'izin' || h.status === 'sakit').length;
  const totalEntries = history.length || 1;
  const percentage = Math.round((totalHadir / totalEntries) * 100);

  const targetJam = 320;
  const daysHadir = Math.max(
    totalHadir,
    todayAttendance && todayAttendance.status === 'hadir' ? 1 : 0
  );
  const accumulatedHours = Math.min(targetJam, daysHadir * 8);
  const remainingHours = Math.max(0, targetJam - accumulatedHours);
  const percentHours = Math.round((accumulatedHours / targetJam) * 100);

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-8">
      <TopNavbar />

      <div className="md:ml-64">

        <div className="max-w-xl mx-auto md:max-w-none md:px-4">
          <div className="bg-[#57564F] text-[#F8F3CE] rounded-b-3xl shadow-md relative overflow-hidden transition-all duration-300">

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isHeaderExpanded ? 'max-h-[350px] opacity-100 p-5 md:px-6' : 'max-h-0 opacity-0 p-0'
              }`}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <img
                  src={user?.photo || student?.photo || '/default-avatar.png'}
                  alt={user?.name}
                  className="w-14 h-14 rounded-full object-cover border border-[#DDDAD0]/30 shadow-sm shrink-0"
                />
                <div>
                  <h2 className="text-lg font-bold text-[#F8F3CE] leading-tight">{user?.name}</h2>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DDDAD0]/30 flex items-center justify-between text-xs text-[#DDDAD0]">
                <div>
                  <span className="opacity-80 block text-[10px]">Kelas</span>
                  <span className="font-normal text-white">{student?.class || 'XII RPL 1'}</span>
                </div>
                <div>
                  <span className="opacity-80 block text-[10px]">NIPD</span>
                  <span className="font-normal text-white">{student?.nis || '242510072'}</span>
                </div>
                <div>
                  <span className="opacity-80 block text-[10px]">Tempat PKL</span>
                  <span className="font-normal text-white truncate max-w-[160px] block" title={student?.tempat_pkl || 'PT Naikmarketing'}>
                    {student?.tempat_pkl || 'PT Naikmarketing'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              className="w-full py-1.5 flex items-center justify-center bg-black/25 hover:bg-black/40 text-[#F8F3CE] transition-colors active:scale-98 border-t border-white/10"
              title={isHeaderExpanded ? "Sembunyikan Kartu Profil" : "Tampilkan Kartu Profil"}
              aria-label="Toggle Header Card"
            >
              <ChevronUp
                className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                  isHeaderExpanded ? 'rotate-0' : 'rotate-180'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="max-w-xl mx-auto md:max-w-none p-4 md:px-4 md:py-4 space-y-4">

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#57564F]">Status Presensi Hari Ini</h3>
                <p className="text-[11px] text-[#7A7A73] mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {todayAttendance ? (
                <span className="text-[11px] text-[#7A7A73] font-normal">
                  Sudah Absen {todayAttendance.work_mode ? `(${todayAttendance.work_mode.toUpperCase()})` : ''}
                </span>
              ) : (
                <span className="text-[11px] text-[#7A7A73] font-normal">
                  Belum Absen
                </span>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-[#DDDAD0]">
              {todayAttendance ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7A7A73]">Jam Masuk Presensi:</span>
                    <span className="font-normal text-[#57564F]">{todayAttendance.attendance_time} WIB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7A73]">Jam Praktik:</span>
                    <span className="font-normal text-[#57564F]">08:00 - 16:00 WIB (8 Jam)</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#7A7A73]">Lokasi Presensi:</span>
                    <span className="font-normal text-[#57564F] text-right max-w-[220px] truncate" title={todayAttendance.location}>
                      {todayAttendance.location}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#57564F] font-normal">Jangan lupa absen!</p>
                  <Link
                    href="/absensi"
                    className="border border-[#DDDAD0] hover:border-[#57564F] hover:bg-[#f9f8f3] text-[#57564F] font-bold text-xs px-3.5 py-1.5 rounded-full transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Absen
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-white rounded-2xl py-2 px-3.5 shadow-sm border border-[#DDDAD0] flex items-center divide-x divide-[#DDDAD0] h-full">
              <Link
                href="/absensi"
                className="flex-1 flex items-center justify-center gap-2 py-0.5 text-xs font-normal text-[#57564F] hover:opacity-80 transition-opacity active:scale-95"
              >
                <Camera className="w-4 h-4 text-[#57564F]" />
                <span>Absen</span>
              </Link>

              <Link
                href="/aktivitas"
                className="flex-1 flex items-center justify-center gap-2 py-0.5 text-xs font-normal text-[#57564F] hover:opacity-80 transition-opacity active:scale-95"
              >
                <Calendar className="w-4 h-4 text-[#57564F]" />
                <span>Journal</span>
              </Link>
            </div>

            <div className="bg-white rounded-2xl py-1.5 px-3.5 shadow-sm border border-[#DDDAD0] flex items-center divide-x divide-[#DDDAD0] text-center h-full">
              <div className="flex-1 py-0.5">
                <span className="text-sm md:text-base font-bold text-[#57564F] leading-tight block">{totalHadir}</span>
                <span className="block text-[10px] font-normal text-[#7A7A73] leading-tight mt-0.5">Hadir</span>
              </div>
              <div className="flex-1 py-0.5">
                <span className="text-sm md:text-base font-bold text-[#57564F] leading-tight block">{totalIzinSakit}</span>
                <span className="block text-[10px] font-normal text-[#7A7A73] leading-tight mt-0.5">Izin / Sakit</span>
              </div>
              <div className="flex-1 py-0.5">
                <span className="text-sm md:text-base font-bold text-[#57564F] leading-tight block">{history.length}</span>
                <span className="block text-[10px] font-normal text-[#7A7A73] leading-tight mt-0.5">Total Hari</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#57564F]">Aktivitas Terbaru</h3>
              <Link href="/aktivitas" className="text-xs text-[#57564F] font-bold hover:underline flex items-center gap-0.5">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-6 text-[#7A7A73] text-xs">
                Belum ada aktivitas PKL yang dicatat.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 3).map((act) => (
                  <div key={act.id} className="p-3 bg-[#f9f8f3] rounded-xl border border-[#DDDAD0] flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#57564F] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-[#57564F]">{act.title}</h4>
                      <p className="text-[11px] text-[#7A7A73] mt-0.5 line-clamp-2">{act.description}</p>
                      <span className="text-[10px] text-[#7A7A73] mt-1 block">
                        {new Date(act.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
