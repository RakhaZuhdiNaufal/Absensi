'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  ShieldCheck,
  Users,
  UserCog,
  BookOpen,
  History,
  UserPlus,
  PlusCircle,
  ExternalLink,
  X,
  Search,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success || meData.user.role !== 'super_admin') {
        router.push('/login');
        return;
      }
      setUser(meData.user);

      const res = await fetch('/api/superadmin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }

      // Fetch recent journals as well
      const actRes = await fetch('/api/superadmin/activities');
      const actData = await actRes.json();
      if (actData.success) {
        setRecentActivities((actData.activities || []).slice(0, 5));
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A73]">Memuat Super Admin Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-12">
      <TopNavbar />

      <div className="md:ml-64">
        {/* Header Hero Banner */}
        <div className="max-w-5xl mx-auto md:max-w-none md:px-6 md:pt-4">
          <div className="bg-[#57564F] text-[#F8F3CE] p-6 sm:rounded-3xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs text-[#DDDAD0] font-semibold flex items-center gap-1.5 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#F8F3CE]" /> Super Admin Control Center
                </span>
                <h1 className="text-2xl font-black text-[#F8F3CE] leading-tight">
                  Halo, {user?.name || 'Administrator'}!
                </h1>
                <p className="text-xs text-[#DDDAD0]/80 mt-1">
                  Pusat kendali operasional, verifikasi presensi, dan manajemen akun PKL terpadu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/superadmin/siswa"
                  className="bg-[#F8F3CE] hover:bg-white text-[#57564F] text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Kelola Siswa
                </Link>
                <Link
                  href="/superadmin/pembimbing"
                  className="bg-white/15 hover:bg-white/25 text-[#F8F3CE] border border-white/20 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <UserCog className="w-3.5 h-3.5" /> Pembimbing
                </Link>
              </div>
            </div>

            {/* Metric Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                href="/superadmin/siswa"
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/15 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#DDDAD0] font-semibold">Total Siswa</span>
                  <Users className="w-4 h-4 text-[#DDDAD0] group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-white">{stats?.totalStudents || 0}</span>
                <span className="text-[10px] text-[#F8F3CE] block mt-1 font-medium">Buka Manajemen &rarr;</span>
              </Link>

              <Link
                href="/superadmin/pembimbing"
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/15 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#DDDAD0] font-semibold">Pembimbing PKL</span>
                  <UserCog className="w-4 h-4 text-[#DDDAD0] group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-white">{stats?.totalAdmins || 0}</span>
                <span className="text-[10px] text-[#F8F3CE] block mt-1 font-medium">Buka Data &rarr;</span>
              </Link>

              <Link
                href="/superadmin/riwayat"
                className="bg-emerald-500/20 hover:bg-emerald-500/25 backdrop-blur-md p-4 rounded-2xl border border-emerald-400/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-emerald-200 font-semibold">Absensi Hari Ini</span>
                  <History className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-emerald-300">{stats?.todayAttendance || 0}</span>
                <span className="text-[10px] text-emerald-200 block mt-1 font-medium">Audit Presensi &rarr;</span>
              </Link>

              <Link
                href="/superadmin/jurnal"
                className="bg-[#F8F3CE]/20 hover:bg-[#F8F3CE]/25 backdrop-blur-md p-4 rounded-2xl border border-[#F8F3CE]/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#F8F3CE] font-semibold">Total Jurnal PKL</span>
                  <BookOpen className="w-4 h-4 text-[#F8F3CE] group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-[#F8F3CE]">{recentActivities.length > 0 ? `${recentActivities.length}+` : stats?.totalAttendance || 0}</span>
                <span className="text-[10px] text-[#F8F3CE] block mt-1 font-medium">Cek Aktivitas &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-5xl mx-auto md:max-w-none p-4 md:p-6 space-y-6">

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/superadmin/siswa"
              className="bg-white p-3.5 rounded-2xl border border-[#DDDAD0] hover:border-[#57564F] shadow-sm hover:shadow transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-[#57564F] truncate">Cek & Tambah Siswa</h4>
                <p className="text-[10px] text-[#7A7A73] truncate">Kelola akun & profil</p>
              </div>
            </Link>

            <Link
              href="/superadmin/pembimbing"
              className="bg-white p-3.5 rounded-2xl border border-[#DDDAD0] hover:border-[#57564F] shadow-sm hover:shadow transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center shrink-0">
                <UserCog className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-[#57564F] truncate">Cek Pembimbing</h4>
                <p className="text-[10px] text-[#7A7A73] truncate">Atur akun pembimbing</p>
              </div>
            </Link>

            <Link
              href="/superadmin/jurnal"
              className="bg-white p-3.5 rounded-2xl border border-[#DDDAD0] hover:border-[#57564F] shadow-sm hover:shadow transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-[#57564F] truncate">Laporan Jurnal</h4>
                <p className="text-[10px] text-[#7A7A73] truncate">Review aktivitas harian</p>
              </div>
            </Link>

            <Link
              href="/superadmin/riwayat"
              className="bg-white p-3.5 rounded-2xl border border-[#DDDAD0] hover:border-[#57564F] shadow-sm hover:shadow transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-[#57564F] truncate">Riwayat Absen</h4>
                <p className="text-[10px] text-[#7A7A73] truncate">GPS, selfie & status</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feed Absensi Terbaru */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]/70">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-[#57564F] uppercase tracking-wider">Aktivitas Absensi Terbaru</h3>
                </div>
                <Link href="/superadmin/riwayat" className="text-[11px] font-bold text-[#57564F] hover:underline flex items-center gap-1">
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {(stats?.recentAttendance || []).length === 0 ? (
                <p className="text-xs text-[#7A7A73] text-center py-6">Belum ada aktivitas absensi terbaru.</p>
              ) : (
                <div className="space-y-2.5">
                  {(stats?.recentAttendance || []).slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAttendance(item)}
                      className="p-3 bg-[#f9f8f3] hover:bg-[#f3f0e6] rounded-2xl border border-[#DDDAD0] flex items-center justify-between text-xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.student_photo || '/default-avatar.png'}
                          alt={item.student_name}
                          className="w-10 h-10 rounded-full object-cover border border-[#DDDAD0] shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-bold text-[#57564F] truncate group-hover:text-black">{item.student_name}</h4>
                          <span className="text-[11px] text-[#7A7A73] block truncate">{item.tempat_pkl}</span>
                          <span className="text-[10px] text-[#7A7A73]">{item.attendance_date} &bull; {item.attendance_time} WIB</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'hadir'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {item.work_mode ? item.work_mode.toUpperCase() : item.status}
                        </span>
                        <span className="text-[10px] text-[#57564F] font-bold block mt-1 underline">Audit</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feed Jurnal PKL Terbaru */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]/70">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#57564F]" />
                  <h3 className="text-xs font-bold text-[#57564F] uppercase tracking-wider">Jurnal Siswa Terbaru</h3>
                </div>
                <Link href="/superadmin/jurnal" className="text-[11px] font-bold text-[#57564F] hover:underline flex items-center gap-1">
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentActivities.length === 0 ? (
                <p className="text-xs text-[#7A7A73] text-center py-6">Belum ada jurnal kegiatan yang disubmit.</p>
              ) : (
                <div className="space-y-2.5">
                  {recentActivities.slice(0, 5).map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setSelectedJournal(act)}
                      className="p-3 bg-[#f9f8f3] hover:bg-[#f3f0e6] rounded-2xl border border-[#DDDAD0] text-xs transition-all cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#57564F] group-hover:text-black">{act.student_name}</span>
                        <span className="text-[10px] text-[#7A7A73]">{act.activity_date}</span>
                      </div>
                      <h5 className="font-semibold text-xs text-[#57564F] line-clamp-1">{act.title}</h5>
                      <p className="text-[11px] text-[#7A7A73] line-clamp-1">{act.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Detail Audit Absensi */}
      {selectedAttendance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-sm font-bold text-[#57564F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#57564F]" /> Audit Verifikasi Presensi Siswa
              </h3>
              <button onClick={() => setSelectedAttendance(null)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAttendance.photo && (
              <div className="rounded-2xl overflow-hidden bg-black border border-[#DDDAD0]">
                <img src={selectedAttendance.photo} alt="Foto Absen" className="w-full max-h-64 object-cover mx-auto" />
              </div>
            )}

            <div className="bg-[#f9f8f3] p-3.5 rounded-2xl border border-[#DDDAD0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Nama Siswa:</span>
                <span className="font-bold text-[#57564F]">{selectedAttendance.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Waktu Masuk:</span>
                <span className="font-bold text-[#57564F]">{selectedAttendance.attendance_date} ({selectedAttendance.attendance_time})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Status Presensi:</span>
                <span className="font-bold text-[#57564F] uppercase">
                  {selectedAttendance.work_mode ? selectedAttendance.work_mode.toUpperCase() : selectedAttendance.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Koordinat GPS:</span>
                <span className="font-mono text-[11px] text-[#57564F]">{selectedAttendance.latitude}, {selectedAttendance.longitude}</span>
              </div>
              <div className="pt-2 border-t border-[#DDDAD0]">
                <span className="text-[#7A7A73] block mb-0.5">Alamat Lokasi:</span>
                <span className="font-medium text-[#57564F] block leading-relaxed">{selectedAttendance.location || 'Lokasi terverifikasi'}</span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${selectedAttendance.latitude},${selectedAttendance.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <ExternalLink className="w-4 h-4" /> Buka Lokasi di Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Modal Detail Jurnal Siswa */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-sm font-bold text-[#57564F] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#57564F]" /> Detail Jurnal Siswa
              </h3>
              <button onClick={() => setSelectedJournal(null)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#f9f8f3] p-3.5 rounded-2xl border border-[#DDDAD0] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Siswa:</span>
                  <span className="font-bold text-[#57564F]">{selectedJournal.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Tanggal:</span>
                  <span className="font-semibold text-[#57564F]">{selectedJournal.activity_date}</span>
                </div>
                {(selectedJournal.start_time || selectedJournal.end_time) && (
                  <div className="flex justify-between">
                    <span className="text-[#7A7A73]">Waktu Pengerjaan:</span>
                    <span className="font-semibold text-[#57564F]">{selectedJournal.start_time || '-'} s/d {selectedJournal.end_time || '-'} WIB</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#57564F] mb-1">{selectedJournal.title}</h4>
                <div className="bg-[#f9f8f3] p-4 rounded-2xl border border-[#DDDAD0] text-[#57564F] whitespace-pre-wrap leading-relaxed text-xs">
                  {selectedJournal.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedJournal(null)}
              className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
