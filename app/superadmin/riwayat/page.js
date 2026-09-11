'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import * as XLSX from 'xlsx';
import {
  History,
  Search,
  Calendar,
  Download,
  X,
  ExternalLink,
  ChevronDown,
  Filter,
  MapPin,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function SuperAdminRiwayatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [customDate, setCustomDate] = useState('');

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success || meData.user.role !== 'super_admin') {
        router.push('/login');
        return;
      }
      setUser(meData.user);

      await reloadAttendance();
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const reloadAttendance = async () => {
    const res = await fetch('/api/superadmin/attendance');
    const data = await res.json();
    if (data.success) {
      setAttendance(data.attendance || []);
    }
  };

  const filteredAttendance = attendance.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.student_name || '').toLowerCase().includes(q) ||
      (item.nis || '').toLowerCase().includes(q) ||
      (item.tempat_pkl || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      item.status === statusFilter ||
      (statusFilter === 'izin' && (item.status === 'izin' || item.status === 'sakit'));

    let matchesDate = true;
    if (customDate) {
      matchesDate = item.attendance_date === customDate;
    } else if (rangeFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      matchesDate = item.attendance_date === todayStr;
    } else if (rangeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      matchesDate = new Date(item.attendance_date) >= weekAgo;
    } else if (rangeFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000);
      matchesDate = new Date(item.attendance_date) >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExportExcel = () => {
    if (filteredAttendance.length === 0) {
      alert('Tidak ada data absensi untuk diekspor.');
      return;
    }

    const dataToExport = filteredAttendance.map((item, index) => ({
      No: index + 1,
      'Nama Siswa': item.student_name,
      NIS: item.nis,
      Kelas: item.class,
      'Tempat PKL': item.tempat_pkl,
      Tanggal: item.attendance_date,
      Waktu: `${item.attendance_time} WIB`,
      Status: item.status.toUpperCase(),
      'Mode Kerja': (item.work_mode || 'wfo').toUpperCase(),
      Latitude: item.latitude,
      Longitude: item.longitude,
      'Alamat Lokasi': item.location || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Presensi PKL');

    const fileName = `Audit_Presensi_PKL_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A73]">Memuat riwayat absensi siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-12">
      <TopNavbar />

      <div className="md:ml-64">
        {/* Top Header Banner */}
        <div className="max-w-6xl mx-auto md:max-w-none md:px-6 md:pt-4">
          <div className="bg-[#57564F] text-[#F8F3CE] p-6 sm:rounded-3xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#DDDAD0] font-semibold flex items-center gap-1.5 uppercase tracking-wider mb-1">
                  <History className="w-4 h-4 text-[#F8F3CE]" /> Super Admin Audit
                </span>
                <h1 className="text-2xl font-black text-[#F8F3CE] leading-tight">
                  Riwayat & Audit Presensi Siswa PKL
                </h1>
                <p className="text-xs text-[#DDDAD0]/80 mt-1">
                  Verifikasi kehadiran, bukti foto selfie, koordinat GPS terverifikasi, dan log waktu masuk siswa.
                </p>
              </div>

              <button
                onClick={handleExportExcel}
                className="bg-[#F8F3CE] hover:bg-white text-[#57564F] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" /> Ekspor ke Excel
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-6xl mx-auto md:max-w-none p-4 md:p-6 space-y-4">

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A7A73] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa, NIS, tempat PKL, atau lokasi presensi..."
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Filter Status */}
              <div className="relative inline-block">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 pr-8 text-xs text-[#57564F] font-semibold appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="hadir">Hadir (WFO/WFH)</option>
                  <option value="izin">Izin / Sakit</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A7A73] absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Filter Range */}
              <div className="relative inline-block">
                <select
                  value={rangeFilter}
                  onChange={(e) => {
                    setRangeFilter(e.target.value);
                    if (e.target.value !== 'all') setCustomDate('');
                  }}
                  className="bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 pr-8 text-xs text-[#57564F] font-semibold appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="all">Semua Periode</option>
                  <option value="today">Hari Ini Saja</option>
                  <option value="week">7 Hari Terakhir</option>
                  <option value="month">30 Hari Terakhir</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A7A73] absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Custom Date Picker */}
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setRangeFilter('all');
                }}
                className="bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] font-semibold focus:outline-none cursor-pointer"
              />
              {customDate && (
                <button
                  onClick={() => setCustomDate('')}
                  title="Reset Tanggal"
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Attendance Cards Grid */}
          {filteredAttendance.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#DDDAD0] space-y-3">
              <History className="w-10 h-10 text-[#7A7A73] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#57564F]">Tidak Ada Catatan Presensi Ditemukan</h3>
              <p className="text-xs text-[#7A7A73]">Coba ubah kata kunci pencarian atau sesuaikan filter periode.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAttendance.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAttendance(item)}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] hover:border-[#57564F]/40 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.student_photo || '/default-avatar.png'}
                          alt={item.student_name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#DDDAD0] shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-[#57564F] truncate group-hover:text-black">
                            {item.student_name}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#7A7A73] block truncate">
                            NIS: {item.nis} &bull; {item.class}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                        item.status === 'hadir'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {item.work_mode ? item.work_mode.toUpperCase() : item.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-[#57564F]">
                        <Building className="w-3.5 h-3.5 text-[#7A7A73] shrink-0" />
                        <span className="font-semibold truncate">{item.tempat_pkl}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7A7A73]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.location || 'Lokasi terverifikasi'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DDDAD0]/70 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#57564F] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#7A7A73]" /> {item.attendance_date} &bull; {item.attendance_time} WIB
                    </span>
                    <span className="font-bold text-[#57564F] group-hover:underline">
                      Audit &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Audit Absensi Terperinci */}
      {selectedAttendance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-sm font-bold text-[#57564F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#57564F]" /> Audit Verifikasi Presensi
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

            <div className="bg-[#f9f8f3] p-4 rounded-2xl border border-[#DDDAD0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Siswa:</span>
                <span className="font-bold text-[#57564F]">{selectedAttendance.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">NIPD / NIS:</span>
                <span className="font-semibold text-[#57564F]">{selectedAttendance.nis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Waktu Presensi:</span>
                <span className="font-bold text-[#57564F]">{selectedAttendance.attendance_date} ({selectedAttendance.attendance_time} WIB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Status Kehadiran:</span>
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

      <BottomNav />
    </div>
  );
}
