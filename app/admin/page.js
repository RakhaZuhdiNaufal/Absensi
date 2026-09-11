'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  Search,
  Eye,
  ExternalLink,
  X,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    fetchAdminData();
    const timer = setInterval(fetchAdminData, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchAdminData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success || (meData.user.role !== 'admin' && meData.user.role !== 'super_admin')) {
        router.push('/login');
        return;
      }
      setUser(meData.user);

      const dbRes = await fetch('/api/admin/dashboard');
      const dbData = await dbRes.json();
      if (dbData.success) {
        setDashboardData(dbData);
      }

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
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-12">
        <TopNavbar />
        <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7A7A73]">Memuat...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const attendanceToday = dashboardData?.attendanceToday || [];

  const filteredAttendance = attendanceToday.filter((item) => {
    const sName = item.student_name || '';
    const sNis = item.nis || '';
    const matchesSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sNis.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'all' ||
      item.status === statusFilter ||
      (statusFilter === 'izin' && (item.status === 'izin' || item.status === 'sakit'));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-12">
      <TopNavbar />
      <div className="md:ml-64">
        <div className="max-w-4xl mx-auto md:max-w-none md:px-4">
          <div className="bg-[#57564F] text-[#F8F3CE] p-6 rounded-b-3xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-[#DDDAD0] block font-medium">Pembimbing PKL</span>
                <h2 className="text-xl font-bold text-[#F8F3CE] leading-tight">{user?.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <span className="text-[10px] text-[#DDDAD0] block font-medium">Total Siswa PKL</span>
                <span className="text-2xl font-black text-white">{dashboardData?.totalStudents || 0}</span>
              </div>
              <div className="bg-emerald-500/20 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/30">
                <span className="text-[10px] text-emerald-200 block font-medium">Sudah Absen</span>
                <span className="text-2xl font-black text-emerald-300">{dashboardData?.alreadyAttendedCount || 0}</span>
              </div>
              <div className="bg-rose-500/20 backdrop-blur-md p-3.5 rounded-2xl border border-rose-400/30">
                <span className="text-[10px] text-rose-200 block font-medium">Belum Absen</span>
                <span className="text-2xl font-black text-rose-300">{dashboardData?.notAttendedCount || 0}</span>
              </div>
              <div className="bg-[#F8F3CE]/20 backdrop-blur-md p-3.5 rounded-2xl border border-[#F8F3CE]/30">
                <span className="text-[10px] text-[#F8F3CE] block font-medium">Total Jurnal</span>
                <span className="text-2xl font-black text-[#F8F3CE]">{dashboardData?.totalActivities || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto md:max-w-none p-4 md:p-6 md:pr-8 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#57564F] uppercase tracking-wider">Daftar Absensi Hari Ini</h3>
              <button
                onClick={fetchAdminData}
                className="px-2.5 py-1 bg-[#f9f8f3] hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-medium text-[#57564F] flex items-center gap-1.5 transition-all shadow-2xs"
                title="Segarkan data presensi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#7A7A73] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa atau NIS..."
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>

            <div className="pt-3 border-t border-[#DDDAD0]">
              <div className="relative inline-block w-fit">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-auto bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 pr-8 text-xs text-[#57564F] font-normal focus:outline-none focus:border-[#57564F] focus:ring-1 focus:ring-[#57564F]/20 appearance-none cursor-pointer"
                  style={{ accentColor: '#57564F' }}
                >
                  <option value="all" style={{ background: '#f9f8f3', color: '#57564F' }}>Kategori Status</option>
                  <option value="hadir" style={{ background: '#f9f8f3', color: '#57564F' }}>Sudah Hadir</option>
                  <option value="izin" style={{ background: '#f9f8f3', color: '#57564F' }}>Izin / Sakit</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#7A7A73] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              {filteredAttendance.length === 0 ? (
                <div className="py-8 text-center text-[#7A7A73] text-xs">
                  Tidak ada data absensi siswa yang cocok dengan kriteria pencarian.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {filteredAttendance.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAttendance(item)}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0] hover:border-[#57564F]/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.student_photo || '/default-avatar.png'}
                            alt={item.student_name}
                            className="w-12 h-12 rounded-full object-cover border border-[#DDDAD0] shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#57564F]">{item.student_name}</h4>
                            <p className="text-[11px] text-[#7A7A73] font-medium">{item.class} &bull; NIS: {item.nis}</p>
                            <span className="text-[10px] text-[#57564F] font-medium">{item.tempat_pkl}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch">
                          <span className="text-xs font-normal text-[#57564F] uppercase">
                            {item.work_mode ? item.work_mode.toUpperCase() : item.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAttendance(item);
                            }}
                            className="text-xs text-[#57564F] font-normal hover:underline cursor-pointer"
                          >
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAttendance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-sm font-bold text-[#57564F]">Detail Verifikasi Presensi</h3>
              <button onClick={() => setSelectedAttendance(null)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAttendance.photo && (
              <div className="rounded-2xl overflow-hidden bg-black border border-[#DDDAD0]">
                <img src={selectedAttendance.photo} alt="Foto Bukti" className="w-full max-h-64 object-cover mx-auto" />
              </div>
            )}

            <div className="bg-[#f9f8f3] p-3.5 rounded-2xl border border-[#DDDAD0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Nama Siswa:</span>
                <span className="font-normal text-[#57564F]">{selectedAttendance.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Tanggal:</span>
                <span className="font-normal text-[#57564F]">
                  {selectedAttendance.attendance_date ? new Date(selectedAttendance.attendance_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Waktu Masuk:</span>
                <span className="font-normal text-[#57564F]">{selectedAttendance.attendance_time} WIB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Status:</span>
                <span className="font-normal text-[#57564F] uppercase">
                  {selectedAttendance.work_mode ? selectedAttendance.work_mode.toUpperCase() : selectedAttendance.status}
                </span>
              </div>
              {selectedAttendance.reason && (
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Alasan / Kategori:</span>
                  <span className="font-medium text-[#57564F] capitalize">{selectedAttendance.reason}</span>
                </div>
              )}
              {selectedAttendance.note && (
                <div className="pt-2 border-t border-[#DDDAD0]">
                  <span className="text-[#7A7A73] block mb-0.5">Catatan / Keterangan:</span>
                  <span className="font-normal text-[#57564F] block leading-relaxed italic bg-white p-2 rounded-lg border border-[#DDDAD0]">{selectedAttendance.note}</span>
                </div>
              )}
              {selectedAttendance.latitude && (
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Koordinat:</span>
                  <span className="font-mono text-[11px] font-normal text-[#57564F]">{selectedAttendance.latitude}, {selectedAttendance.longitude}</span>
                </div>
              )}
              {selectedAttendance.location && (
                <div className="pt-2 border-t border-[#DDDAD0]">
                  <span className="text-[#7A7A73] block mb-0.5">Alamat Lokasi:</span>
                  <span className="font-normal text-[#57564F] block leading-relaxed">{selectedAttendance.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
