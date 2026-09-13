'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import * as XLSX from 'xlsx';
import {
  Search,
  X,
  Download
} from 'lucide-react';

export default function AdminAnalystPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success || meData.user.role !== 'admin') {
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

  const students = dashboardData?.students || [];
  const allAttendance = dashboardData?.allAttendance || [];

  const hadirCount = dashboardData?.hadirCount ?? allAttendance.filter(a => (a.status || '').toLowerCase() === 'hadir').length;
  const izinCount = dashboardData?.izinCount ?? allAttendance.filter(a => (a.status || '').toLowerCase() === 'izin').length;
  const sakitCount = dashboardData?.sakitCount ?? allAttendance.filter(a => (a.status || '').toLowerCase() === 'sakit').length;
  const totalRecords = allAttendance.length || 1;

  const hadirPercent = Math.round((hadirCount / totalRecords) * 100) || 0;
  const izinPercent = Math.round((izinCount / totalRecords) * 100) || 0;
  const sakitPercent = Math.round((sakitCount / totalRecords) * 100) || 0;

  const studentStats = students.map((st) => {
    const studentRecords = allAttendance.filter(a =>
      Number(a.student_id) === Number(st.id) ||
      Number(a.student_id) === Number(st.user_id) ||
      (a.nis && st.nis && String(a.nis) === String(st.nis)) ||
      (a.student_name && st.name && a.student_name.toLowerCase() === st.name.toLowerCase())
    );
    const sHadir = studentRecords.filter(a => (a.status || '').toLowerCase() === 'hadir').length;
    const sIzin = studentRecords.filter(a => (a.status || '').toLowerCase() === 'izin').length;
    const sSakit = studentRecords.filter(a => (a.status || '').toLowerCase() === 'sakit').length;
    const sTotal = studentRecords.length;
    const rate = sTotal > 0 ? Math.round((sHadir / sTotal) * 100) : 0;

    return {
      ...st,
      hadir: sHadir,
      izin: sIzin,
      sakit: sSakit,
      total: sTotal,
      rate
    };
  });

  const filteredStudentStats = studentStats.filter((st) =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.nis.includes(searchQuery) ||
    st.tempat_pkl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportSingleStudentExcel = () => {
    if (!selectedStudent) return;

    const studentRecords = (dashboardData?.allAttendance || []).filter(a =>
      Number(a.student_id) === Number(selectedStudent.id) ||
      Number(a.student_id) === Number(selectedStudent.user_id) ||
      (a.nis && selectedStudent.nis && String(a.nis) === String(selectedStudent.nis)) ||
      (a.student_name && selectedStudent.name && a.student_name.toLowerCase() === selectedStudent.name.toLowerCase())
    );

    const summaryData = [
      { 'Keterangan': 'Nama Siswa', 'Nilai': selectedStudent.name },
      { 'Keterangan': 'NIPD', 'Nilai': selectedStudent.nis },
      { 'Keterangan': 'Kelas', 'Nilai': selectedStudent.class },
      { 'Keterangan': 'Tempat PKL', 'Nilai': selectedStudent.tempat_pkl || '-' },
      { 'Keterangan': 'Tingkat Kehadiran', 'Nilai': `${selectedStudent.rate}%` },
      { 'Keterangan': 'Total Hadir (Hari)', 'Nilai': selectedStudent.hadir },
      { 'Keterangan': 'Total Izin (Hari)', 'Nilai': selectedStudent.izin },
      { 'Keterangan': 'Total Sakit (Hari)', 'Nilai': selectedStudent.sakit },
      { 'Keterangan': 'Total Catatan Absensi', 'Nilai': selectedStudent.total }
    ];

    const historyData = studentRecords.map((r, idx) => ({
      'No': idx + 1,
      'Tanggal': r.attendance_date || '-',
      'Waktu': r.attendance_time ? `${r.attendance_time} WIB` : '-',
      'Status': (r.status || '-').toUpperCase(),
      'Lokasi': r.location || '-'
    }));

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsHistory = XLSX.utils.json_to_sheet(historyData.length > 0 ? historyData : [{ 'Status': 'Belum ada riwayat absensi' }]);

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
    XLSX.utils.book_append_sheet(wb, wsHistory, 'Riwayat Presensi');

    const safeName = (selectedStudent.name || 'siswa').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `Rekap_Kehadiran_${safeName}.xlsx`);
  };

  const handleExportAllStudentsExcel = () => {
    if (!studentStats || studentStats.length === 0) return;

    const rekapData = studentStats.map((st, idx) => ({
      'No': idx + 1,
      'Nama Siswa': st.name,
      'NIPD': st.nis,
      'Kelas': st.class,
      'Tempat PKL': st.tempat_pkl || '-',
      'Tingkat Kehadiran': `${st.rate}%`,
      'Hadir (Hari)': st.hadir,
      'Izin (Hari)': st.izin,
      'Sakit (Hari)': st.sakit,
      'Total Catatan (Hari)': st.total
    }));

    const allRecords = (dashboardData?.allAttendance || []).map((r, idx) => ({
      'No': idx + 1,
      'Nama Siswa': r.student_name || '-',
      'NIPD': r.nis || '-',
      'Tanggal': r.attendance_date || '-',
      'Waktu': r.attendance_time ? `${r.attendance_time} WIB` : '-',
      'Status': (r.status || '-').toUpperCase(),
      'Lokasi': r.location || '-'
    }));

    const wb = XLSX.utils.book_new();
    const wsRekap = XLSX.utils.json_to_sheet(rekapData);
    const wsAll = XLSX.utils.json_to_sheet(allRecords.length > 0 ? allRecords : [{ 'Status': 'Belum ada catatan presensi' }]);

    XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi Semua Siswa');
    XLSX.utils.book_append_sheet(wb, wsAll, 'Log Presensi Lengkap');

    XLSX.writeFile(wb, 'Rekap_Analisis_Kehadiran_Seluruh_Siswa.xlsx');
  };

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24">
      <TopNavbar />
      <div className="max-w-4xl mx-auto md:ml-64 md:max-w-none p-4 md:p-6 md:pr-8 space-y-4">

        <div className="bg-white p-5 rounded-3xl border border-[#DDDAD0] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#DDDAD0]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#7A7A73] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari siswa / NIPD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>
          </div>

          <div className="bg-[#f9f8f3] rounded-2xl border border-[#DDDAD0] divide-y divide-[#DDDAD0] overflow-hidden">
            {filteredStudentStats.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7A7A73]">
                Tidak ada data siswa yang cocok.
              </div>
            ) : (
              filteredStudentStats.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudent(st)}
                  className="p-3.5 hover:bg-[#f3f0e6] flex items-end justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.photo || '/default-avatar.png'}
                      alt={st.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#DDDAD0] shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[#57564F] group-hover:text-[#3e3d38] transition-colors leading-tight">{st.name}</h3>
                      <p className="text-xs text-[#7A7A73] font-normal mt-0.5">NIPD: {st.nis}</p>
                      <p className="text-xs text-[#57564F] font-normal">{st.class}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#57564F] group-hover:underline underline-offset-2 shrink-0 self-end pb-0.5">
                    Detail &rarr;
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleExportAllStudentsExcel}
              className="py-2.5 px-4 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] text-[#57564F] border border-[#DDDAD0] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-sm font-bold text-[#57564F]">Detail Analisis Kehadiran</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-xl hover:bg-[#f9f8f3] text-[#7A7A73] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-[#f9f8f3] rounded-2xl flex items-center gap-3">
              <img
                src={selectedStudent.photo || '/default-avatar.png'}
                alt={selectedStudent.name}
                className="w-12 h-12 rounded-full object-cover border border-[#DDDAD0] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#57564F] truncate">{selectedStudent.name}</h4>
                <p className="text-xs text-[#7A7A73]">NIPD: {selectedStudent.nis}</p>
                <p className="text-xs text-[#57564F] font-medium">{selectedStudent.class}</p>
              </div>
            </div>

            <div className="bg-[#f9f8f3] p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-[#7A7A73]">Tingkat Kehadiran</span>
                <span className="text-xs font-normal text-[#57564F]">{selectedStudent.rate}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${selectedStudent.rate}%` }}
                  className={`h-full ${selectedStudent.rate >= 85 ? 'bg-emerald-500' : selectedStudent.rate >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>

            <div className="bg-[#f9f8f3] rounded-2xl p-3.5 grid grid-cols-3 divide-x divide-[#DDDAD0] text-center">
              <div className="px-1">
                <span className="text-[10px] text-[#7A7A73] block font-normal">Hadir</span>
                <span className="text-xs font-normal text-[#57564F]">{selectedStudent.hadir} Hari</span>
              </div>
              <div className="px-1">
                <span className="text-[10px] text-[#7A7A73] block font-normal">Izin</span>
                <span className="text-xs font-normal text-[#57564F]">{selectedStudent.izin} Hari</span>
              </div>
              <div className="px-1">
                <span className="text-[10px] text-[#7A7A73] block font-normal">Sakit</span>
                <span className="text-xs font-normal text-[#57564F]">{selectedStudent.sakit} Hari</span>
              </div>
            </div>

            <div className="bg-[#f9f8f3] p-3 rounded-2xl flex justify-between items-center text-xs">
              <span className="text-[#7A7A73]">Total Catatan Absensi</span>
              <span className="font-normal text-[#57564F]">{selectedStudent.total} Hari</span>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex-1 py-2.5 bg-[#f9f8f3] hover:bg-[#eae8dd] text-[#57564F] border border-[#DDDAD0] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleExportSingleStudentExcel}
                className="flex-1 py-2.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cetak Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
