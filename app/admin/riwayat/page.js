'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  Search,
  Filter,
  ExternalLink,
  FileText,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function AdminRiwayatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  const formatAttendanceDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr).split('T')[0];
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      });
    } catch (e) {
      return String(dateStr).split('T')[0];
    }
  };

  const handleExportExcel = () => {
    if (!filteredAttendance || filteredAttendance.length === 0) {
      alert('Tidak ada data riwayat untuk diunduh');
      return;
    }

    const dataToExport = filteredAttendance.map((item, idx) => ({
      'No': idx + 1,
      'Nama Siswa': item.student_name || '-',
      'NIPD': item.nis || '-',
      'Kelas': item.class || '-',
      'Tempat PKL': item.tempat_pkl || '-',
      'Tanggal': formatAttendanceDate(item.attendance_date),
      'Waktu': item.attendance_time ? `${item.attendance_time} WIB` : '-',
      'Status': (item.status || '-').toUpperCase(),
      'Lokasi': item.location || '-',
      'Alasan': item.reason || '-',
      'Keterangan': item.note || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Absensi');

    const todayStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Riwayat_Kehadiran_Siswa_${todayStr}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24">
        <TopNavbar />
        <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-3 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7A7A73]">Memuat...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const allAttendance = dashboardData?.allAttendance || dashboardData?.attendanceToday || [];

  const filteredAttendance = allAttendance.filter((item) => {
    const sQuery = (searchQuery || '').toLowerCase();
    const studentName = (item.student_name || '').toLowerCase();
    const nis = String(item.nis || '');
    const attDate = String(item.attendance_date || '');

    const matchesSearch = studentName.includes(sQuery) ||
                          nis.includes(sQuery) ||
                          attDate.includes(sQuery);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24">
      <TopNavbar />
      <div className="max-w-4xl mx-auto md:ml-64 md:max-w-none p-4 md:p-6 md:pr-8 space-y-4">

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#DDDAD0] space-y-4">
          <div className="pb-3 border-b border-[#DDDAD0]">
            <h1 className="text-lg font-bold leading-tight text-[#57564F]">Riwayat Kehadiran Siswa</h1>
            <p className="text-xs text-[#7A7A73] font-normal mt-0.5">Daftar seluruh riwayat absensi siswa bimbingan PKL</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#7A7A73] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIPD, atau tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
              <div className="flex gap-2 shrink-0 relative p-0.5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'hadir', label: 'Hadir' },
                  { id: 'izin', label: 'Izin' },
                  { id: 'sakit', label: 'Sakit' },
                ].map((tab) => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 select-none cursor-pointer outline-none shrink-0 border ${
                        isActive
                          ? 'border-[#57564F] text-[#F8F3CE]'
                          : 'bg-[#f9f8f3] text-[#7A7A73] hover:text-[#57564F] border-[#DDDAD0]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="adminStatusFilterPill"
                          className="absolute inset-0 bg-[#57564F] rounded-xl shadow-sm"
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                      <span className="relative z-10 block">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                className="py-2 px-3.5 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] text-[#57564F] border border-[#DDDAD0] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${statusFilter}-${searchQuery}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-3"
          >
            {filteredAttendance.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-[#DDDAD0] text-center text-xs text-[#7A7A73]">
                Tidak ada data riwayat absensi yang ditemukan.
              </div>
            ) : (
              filteredAttendance.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#DDDAD0] space-y-2 hover:border-[#57564F]/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.student_photo || '/default-avatar.png'}
                        alt={item.student_name}
                        className="w-12 h-12 rounded-full object-cover border border-[#DDDAD0] shrink-0"
                      />
                      <div>
                        <h2 className="text-sm font-normal text-[#57564F]">{item.student_name}</h2>
                        <p className="text-xs text-[#7A7A73] font-normal">{item.class}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <span className="text-xs font-normal text-[#57564F] uppercase">
                        {item.work_mode ? item.work_mode.toUpperCase() : item.status}
                      </span>

                      <button
                        onClick={() => setSelectedAttendance(item)}
                        className="text-xs text-[#57564F] font-normal hover:underline cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
                  </div>

                  {(item.status === 'izin' || item.status === 'sakit') && (
                    <div className="p-2.5 bg-[#f9f8f3] rounded-xl border border-[#DDDAD0] flex items-center justify-between text-xs mt-1">
                      <div className="flex items-center gap-2 text-[#57564F]">
                        <FileText className="w-4 h-4 text-[#57564F]" />
                        <div>
                          <span className="font-normal block">Surat Keterangan ({item.status.toUpperCase()})</span>
                          <span className="text-[10px] text-[#7A7A73] font-normal">Format: PDF / Dokumen Digital</span>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert(`Membuka berkas Surat ${item.status.toUpperCase()} (${item.student_name}).pdf`); }}
                        className="px-3 py-1 bg-[#57564F] text-[#F8F3CE] rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-[#474640] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedAttendance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-[#DDDAD0]"
            >
              <button
                onClick={() => setSelectedAttendance(null)}
                className="absolute top-4 right-4 p-2 text-[#7A7A73] hover:text-[#57564F] bg-[#f9f8f3] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-normal text-[#57564F]">Detail Absensi Siswa</h3>

              {selectedAttendance.photo && (
                <div className="rounded-2xl overflow-hidden border border-[#DDDAD0]">
                  <img src={selectedAttendance.photo} alt="Foto Absen" className="w-full max-h-64 object-cover mx-auto" />
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#7A7A73]">Nama Siswa:</span>
                  <span className="font-normal text-[#57564F]">{selectedAttendance.student_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#7A7A73]">NIPD / Kelas:</span>
                  <span className="font-normal text-[#57564F]">{selectedAttendance.nis} ({selectedAttendance.class})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#7A7A73]">Perusahaan PKL:</span>
                  <span className="font-normal text-[#57564F]">{selectedAttendance.tempat_pkl}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#7A7A73]">Tanggal & Waktu:</span>
                  <span className="font-normal text-[#57564F]">{formatAttendanceDate(selectedAttendance.attendance_date)} ({selectedAttendance.attendance_time} WIB)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#7A7A73]">Status:</span>
                  <span className="font-normal text-[#57564F] uppercase">
                    {selectedAttendance.work_mode ? selectedAttendance.work_mode.toUpperCase() : selectedAttendance.status}
                  </span>
                </div>
                {selectedAttendance.reason && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#7A7A73]">Alasan / Kategori:</span>
                    <span className="font-medium text-[#57564F] capitalize">{selectedAttendance.reason}</span>
                  </div>
                )}
                {selectedAttendance.note && (
                  <div className="pt-2 border-t border-[#DDDAD0]">
                    <span className="text-[#7A7A73] block mb-0.5">Catatan / Keterangan:</span>
                    <span className="font-normal text-[#57564F] block leading-relaxed italic bg-[#f9f8f3] p-2 rounded-lg border border-[#DDDAD0]">{selectedAttendance.note}</span>
                  </div>
                )}
                {selectedAttendance.latitude && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
