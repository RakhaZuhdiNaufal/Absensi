'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import * as XLSX from 'xlsx';
import {
  BookOpen,
  Search,
  Calendar,
  Download,
  X,
  Clock,
  User,
  Building,
  GraduationCap,
  Filter,
  ChevronDown
} from 'lucide-react';

export default function SuperAdminJurnalPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedJournal, setSelectedJournal] = useState(null);

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

      await reloadActivities();
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const reloadActivities = async () => {
    const res = await fetch('/api/superadmin/activities');
    const data = await res.json();
    if (data.success) {
      setActivities(data.activities || []);
    }
  };

  const studentOptions = Array.from(
    new Map(
      activities.map((a) => [a.student_id, { id: a.student_id, name: a.student_name, nis: a.nis }])
    ).values()
  );

  const filteredActivities = activities.filter((act) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (act.title || '').toLowerCase().includes(q) ||
      (act.description || '').toLowerCase().includes(q) ||
      (act.student_name || '').toLowerCase().includes(q) ||
      (act.nis || '').toLowerCase().includes(q);

    const matchesDate = !dateFilter || act.activity_date === dateFilter;
    const matchesStudent =
      selectedStudentFilter === 'all' || String(act.student_id) === String(selectedStudentFilter);

    return matchesSearch && matchesDate && matchesStudent;
  });

  const handleExportExcel = () => {
    if (filteredActivities.length === 0) {
      alert('Tidak ada data jurnal untuk diekspor.');
      return;
    }

    const dataToExport = filteredActivities.map((act, index) => ({
      No: index + 1,
      'Nama Siswa': act.student_name,
      NIS: act.nis,
      Kelas: act.class,
      'Tempat PKL': act.tempat_pkl,
      Tanggal: act.activity_date,
      'Jam Mulai': act.start_time || '-',
      'Jam Selesai': act.end_time || '-',
      'Judul Jurnal': act.title,
      'Deskripsi Aktivitas': act.description
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Jurnal PKL');

    const fileName = `Jurnal_PKL_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A73]">Memuat jurnal kegiatan PKL...</p>
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
                  <BookOpen className="w-4 h-4 text-[#F8F3CE]" /> Super Admin Monitoring
                </span>
                <h1 className="text-2xl font-black text-[#F8F3CE] leading-tight">
                  Jurnal Aktivitas Harian Siswa PKL
                </h1>
                <p className="text-xs text-[#DDDAD0]/80 mt-1">
                  Pantau seluruh logbook kegiatan, jam pengerjaan, dan pencapaian kompetensi siswa di tempat PKL.
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
                placeholder="Cari judul kegiatan, deskripsi, nama siswa, atau NIS..."
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Filter Siswa */}
              <div className="relative inline-block">
                <select
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                  className="bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 pr-8 text-xs text-[#57564F] font-semibold appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="all">Semua Siswa ({studentOptions.length})</option>
                  {studentOptions.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.nis})</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A7A73] absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Filter Tanggal */}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] font-semibold focus:outline-none cursor-pointer"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  title="Hapus Filter Tanggal"
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Activities Grid */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#DDDAD0] space-y-3">
              <BookOpen className="w-10 h-10 text-[#7A7A73] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#57564F]">Tidak Ada Jurnal Ditemukan</h3>
              <p className="text-xs text-[#7A7A73]">Coba sesuaikan pencarian atau reset filter tanggal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedJournal(act)}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] hover:border-[#57564F]/40 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-2">
                    {/* Header: Student Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={act.student_photo || '/default-avatar.png'}
                        alt={act.student_name}
                        className="w-10 h-10 rounded-2xl object-cover border border-[#DDDAD0] shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-[#57564F] truncate group-hover:text-black">
                          {act.student_name}
                        </h4>
                        <span className="text-[11px] text-[#7A7A73] block truncate">
                          NIS: {act.nis} &bull; {act.tempat_pkl}
                        </span>
                      </div>
                    </div>

                    {/* Journal Title & Snippet */}
                    <div className="pt-2 border-t border-[#DDDAD0]/70 space-y-1">
                      <h3 className="font-bold text-sm text-[#57564F] line-clamp-1 group-hover:underline">
                        {act.title}
                      </h3>
                      <p className="text-xs text-[#7A7A73] line-clamp-3 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer: Date, Time & Detail */}
                  <div className="pt-2 border-t border-[#DDDAD0]/70 flex items-center justify-between text-[11px] text-[#7A7A73]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#57564F] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#7A7A73]" /> {act.activity_date}
                      </span>
                      {(act.start_time || act.end_time) && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#7A7A73]" /> {act.start_time || '-'} - {act.end_time || '-'}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#57564F] group-hover:underline">
                      Baca Detail &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Detail Jurnal Lengkap */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#57564F]" />
                <h3 className="text-sm font-bold text-[#57564F]">Detail Jurnal Aktivitas PKL</h3>
              </div>
              <button onClick={() => setSelectedJournal(null)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student metadata */}
            <div className="bg-[#f9f8f3] p-3.5 rounded-2xl border border-[#DDDAD0] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Nama Siswa:</span>
                <span className="font-bold text-[#57564F]">{selectedJournal.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">NIPD / NIS:</span>
                <span className="font-semibold text-[#57564F]">{selectedJournal.nis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Tempat PKL:</span>
                <span className="font-semibold text-[#57564F]">{selectedJournal.tempat_pkl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Tanggal:</span>
                <span className="font-semibold text-[#57564F]">{selectedJournal.activity_date}</span>
              </div>
              {(selectedJournal.start_time || selectedJournal.end_time) && (
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Rentang Waktu:</span>
                  <span className="font-semibold text-[#57564F]">{selectedJournal.start_time || '-'} s/d {selectedJournal.end_time || '-'} WIB</span>
                </div>
              )}
            </div>

            {/* Full text */}
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-[#57564F]">{selectedJournal.title}</h2>
              <div className="bg-[#f9f8f3] p-4 rounded-2xl border border-[#DDDAD0] text-[#57564F] text-xs leading-relaxed whitespace-pre-wrap">
                {selectedJournal.description}
              </div>
            </div>

            <button
              onClick={() => setSelectedJournal(null)}
              className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
