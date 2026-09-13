'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  History,
  BookOpen,
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

export default function SuperAdminSiswaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('attendance'); // 'attendance' or 'activities'

  const [selectedAuditAttendance, setSelectedAuditAttendance] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '', // NIS
    email: '',
    password: '',
    class: 'XII RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: '',
    alamat_rumah: '',
    alamat_pkl: '',
    pembimbing_id: '',
    radius_meters: 50,
    target_lat: -6.404419,
    target_lng: 106.791996,
    home_lat: -6.388280,
    home_lng: 106.854367,
    home_radius_meters: 50
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      await reloadStudents();

      const mRes = await fetch('/api/superadmin/mentors');
      const mData = await mRes.json();
      if (mData.success) {
        setMentors(mData.mentors || []);
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const reloadStudents = async () => {
    const res = await fetch('/api/superadmin/students');
    const data = await res.json();
    if (data.success) {
      setStudents(data.students || []);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: 'password123',
      class: 'XII RPL 1',
      major: 'Rekayasa Perangkat Lunak',
      tempat_pkl: '',
      alamat_rumah: '',
      alamat_pkl: '',
      pembimbing_id: mentors.length > 0 ? mentors[0].id : '',
      radius_meters: 50,
      target_lat: -6.404419,
      target_lng: 106.791996,
      home_lat: -6.388280,
      home_lng: 106.854367,
      home_radius_meters: 50
    });
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.id,
      name: student.name || '',
      username: student.nis || student.username || '',
      email: student.email || '',
      password: '', // leave empty unless changing
      class: student.class || 'XII RPL 1',
      major: student.major || 'Rekayasa Perangkat Lunak',
      tempat_pkl: student.tempat_pkl || '',
      alamat_rumah: student.alamat_rumah || '',
      alamat_pkl: student.alamat_pkl || '',
      pembimbing_id: student.pembimbing_id || (mentors.length > 0 ? mentors[0].id : ''),
      radius_meters: student.radius_meters || 50,
      target_lat: student.target_lat !== undefined && student.target_lat !== null ? student.target_lat : -6.404419,
      target_lng: student.target_lng !== undefined && student.target_lng !== null ? student.target_lng : 106.791996,
      home_lat: student.home_lat !== undefined && student.home_lat !== null ? student.home_lat : -6.388280,
      home_lng: student.home_lng !== undefined && student.home_lng !== null ? student.home_lng : 106.854367,
      home_radius_meters: student.home_radius_meters || student.radius_meters || 50
    });
    setFormError('');
    setFormSuccess('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleOpenHistory = async (student) => {
    setSelectedStudent(student);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/superadmin/students?studentId=${student.id}`);
      const data = await res.json();
      if (data.success) {
        setStudentHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/superadmin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Gagal menambahkan siswa.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess('Siswa berhasil ditambahkan!');
      await reloadStudents();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsSubmitting(false);
      }, 700);
    } catch (err) {
      setFormError('Terjadi kesalahan jaringan: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/superadmin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Gagal memperbarui profil siswa.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess('Profil siswa berhasil diperbarui!');
      await reloadStudents();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setIsSubmitting(false);
      }, 700);
    } catch (err) {
      setFormError('Terjadi kesalahan jaringan: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/superadmin/students?studentId=${selectedStudent.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Gagal menghapus akun siswa.');
        setIsSubmitting(false);
        return;
      }

      await reloadStudents();
      setIsDeleteModalOpen(false);
      setIsSubmitting(false);
      setSelectedStudent(null);
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.nis || '').toLowerCase().includes(q) ||
      (s.tempat_pkl || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q);
    const matchesClass = classFilter === 'all' || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const availableClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A73]">Memuat data siswa...</p>
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
                  <Users className="w-4 h-4 text-[#F8F3CE]" /> Super Admin Panel
                </span>
                <h1 className="text-2xl font-black text-[#F8F3CE] leading-tight">
                  Manajemen Data Siswa PKL
                </h1>
                <p className="text-xs text-[#DDDAD0]/80 mt-1">
                  Kelola profil, pembimbing, akses kredensial, riwayat presensi, dan jurnal harian seluruh siswa.
                </p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="bg-[#F8F3CE] hover:bg-white text-[#57564F] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Siswa Baru
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-6xl mx-auto md:max-w-none p-4 md:p-6 space-y-4">

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A7A73] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, NIPD / NIS, tempat PKL, atau email..."
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-[#7A7A73]">Kelas:</span>
              <div className="relative inline-block">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 pr-8 text-xs text-[#57564F] font-semibold appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="all">Semua Kelas ({students.length})</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A7A73] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Students Grid */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#DDDAD0] space-y-3">
              <Users className="w-10 h-10 text-[#7A7A73] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#57564F]">Tidak Ada Data Siswa Ditemukan</h3>
              <p className="text-xs text-[#7A7A73]">Coba ubah kata kunci pencarian atau tambahkan siswa baru.</p>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 bg-[#57564F] text-[#F8F3CE] text-xs font-bold px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" /> Tambah Siswa Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] hover:border-[#57564F]/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Card Top: Avatar & Action Buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={st.photo || '/default-avatar.png'}
                          alt={st.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#DDDAD0] shrink-0"
                        />
                        <div className="truncate">
                          <h3 className="font-bold text-sm text-[#57564F] truncate group-hover:text-black">
                            {st.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-[#7A7A73] block truncate">
                            NIS: {st.nis || st.username} &bull; {st.class}
                          </span>
                        </div>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          title="Otak-atik Profil Siswa"
                          className="p-1.5 rounded-lg bg-[#f9f8f3] hover:bg-[#57564F] hover:text-[#F8F3CE] text-[#57564F] transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(st)}
                          title="Hapus Akun Siswa"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta info tags */}
                    <div className="mt-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-[#57564F]">
                        <Building className="w-3.5 h-3.5 text-[#7A7A73] shrink-0" />
                        <span className="font-medium truncate">{st.tempat_pkl || 'Tempat PKL belum diatur'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7A7A73]">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Pembimbing: <b className="text-[#57564F]">{st.pembimbing_name || 'Pak Ridwan'}</b></span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7A7A73]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Metrics & View History Button */}
                  <div className="pt-3 border-t border-[#DDDAD0]/70 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="bg-[#f9f8f3] px-2.5 py-1 rounded-lg font-bold text-[#57564F] border border-[#DDDAD0]">
                        {st.total_attendance || 0} Absen
                      </span>
                      <span className="bg-[#f9f8f3] px-2.5 py-1 rounded-lg font-bold text-[#57564F] border border-[#DDDAD0]">
                        {st.total_activities || 0} Jurnal
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenHistory(st)}
                      className="text-xs font-bold text-[#57564F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" /> Cek Riwayat & Jurnal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Tambah Siswa Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#57564F]">Tambah Akun Siswa PKL</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#57564F] mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Narendra Bintang Ramadan"
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">NIPD / NIS (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: 242510072"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Password Awal *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Default: 123456"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Email Siswa *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="siswa@sekolah.sch.id"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="XII RPL 1"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Jurusan</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Rekayasa Perangkat Lunak"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Pilih Pembimbing</label>
                  <select
                    value={formData.pembimbing_id}
                    onChange={(e) => setFormData({ ...formData, pembimbing_id: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  >
                    <option value="">-- Tanpa Pembimbing --</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} (@{m.username})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Perusahaan / Tempat PKL</label>
                <input
                  type="text"
                  value={formData.tempat_pkl}
                  onChange={(e) => setFormData({ ...formData, tempat_pkl: e.target.value })}
                  placeholder="Contoh: PT Naikmarketing"
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Alamat Tempat PKL</label>
                <textarea
                  rows={2}
                  value={formData.alamat_pkl}
                  onChange={(e) => setFormData({ ...formData, alamat_pkl: e.target.value })}
                  placeholder="Alamat kantor tempat PKL..."
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl p-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Alamat Rumah</label>
                <textarea
                  rows={2}
                  value={formData.alamat_rumah}
                  onChange={(e) => setFormData({ ...formData, alamat_rumah: e.target.value })}
                  placeholder="Alamat tempat tinggal siswa..."
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl p-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              {/* Pengaturan Radius & Koordinat Alamat 1 (PKL) */}
              <div className="bg-[#f9f8f3] p-3 rounded-2xl border border-[#DDDAD0] space-y-2">
                <span className="block text-xs font-bold text-[#57564F]">Titik & Radius Alamat 1 (Lokasi PKL)</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.target_lat}
                      onChange={(e) => setFormData({ ...formData, target_lat: e.target.value })}
                      placeholder="-6.404419"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.target_lng}
                      onChange={(e) => setFormData({ ...formData, target_lng: e.target.value })}
                      placeholder="106.791996"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Radius (m)</label>
                    <input
                      type="number"
                      value={formData.radius_meters}
                      onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                </div>
              </div>

              {/* Pengaturan Radius & Koordinat Alamat 2 (Alternatif/Rumah) */}
              <div className="bg-[#f9f8f3] p-3 rounded-2xl border border-[#DDDAD0] space-y-2">
                <span className="block text-xs font-bold text-[#57564F]">Titik & Radius Alamat 2 (Lokasi Alternatif)</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.home_lat}
                      onChange={(e) => setFormData({ ...formData, home_lat: e.target.value })}
                      placeholder="-6.396742"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.home_lng}
                      onChange={(e) => setFormData({ ...formData, home_lng: e.target.value })}
                      placeholder="106.839228"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Radius (m)</label>
                    <input
                      type="number"
                      value={formData.home_radius_meters}
                      onChange={(e) => setFormData({ ...formData, home_radius_meters: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDDAD0] text-xs font-bold text-[#7A7A73] hover:bg-[#f9f8f3]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#57564F] text-[#F8F3CE] text-xs font-bold hover:bg-[#474640] shadow transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Otak-atik Profil Siswa (Edit) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#57564F]">Otak-atik Profil Siswa</h3>
                  <span className="text-[11px] text-[#7A7A73]">ID: #{selectedStudent?.id} &bull; {selectedStudent?.name}</span>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#57564F] mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">NIPD / NIS (Username)</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Reset Password</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Kosongkan jika tak diubah"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Jurusan</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Pembimbing PKL</label>
                  <select
                    value={formData.pembimbing_id}
                    onChange={(e) => setFormData({ ...formData, pembimbing_id: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  >
                    <option value="">-- Tanpa Pembimbing --</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} (@{m.username})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Tempat PKL</label>
                <input
                  type="text"
                  value={formData.tempat_pkl}
                  onChange={(e) => setFormData({ ...formData, tempat_pkl: e.target.value })}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Alamat Tempat PKL</label>
                <textarea
                  rows={2}
                  value={formData.alamat_pkl}
                  onChange={(e) => setFormData({ ...formData, alamat_pkl: e.target.value })}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl p-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Alamat Rumah</label>
                <textarea
                  rows={2}
                  value={formData.alamat_rumah}
                  onChange={(e) => setFormData({ ...formData, alamat_rumah: e.target.value })}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl p-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              {/* Pengaturan Radius & Koordinat Alamat 1 (PKL) */}
              <div className="bg-[#f9f8f3] p-3 rounded-2xl border border-[#DDDAD0] space-y-2">
                <span className="block text-xs font-bold text-[#57564F]">Titik & Radius Alamat 1 (Lokasi PKL)</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.target_lat}
                      onChange={(e) => setFormData({ ...formData, target_lat: e.target.value })}
                      placeholder="-6.404419"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.target_lng}
                      onChange={(e) => setFormData({ ...formData, target_lng: e.target.value })}
                      placeholder="106.791996"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Radius (m)</label>
                    <input
                      type="number"
                      value={formData.radius_meters}
                      onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                </div>
              </div>

              {/* Pengaturan Radius & Koordinat Alamat 2 (Alternatif/Rumah) */}
              <div className="bg-[#f9f8f3] p-3 rounded-2xl border border-[#DDDAD0] space-y-2">
                <span className="block text-xs font-bold text-[#57564F]">Titik & Radius Alamat 2 (Lokasi Alternatif)</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.home_lat}
                      onChange={(e) => setFormData({ ...formData, home_lat: e.target.value })}
                      placeholder="-6.396742"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.home_lng}
                      onChange={(e) => setFormData({ ...formData, home_lng: e.target.value })}
                      placeholder="106.839228"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A7A73] mb-0.5">Radius (m)</label>
                    <input
                      type="number"
                      value={formData.home_radius_meters}
                      onChange={(e) => setFormData({ ...formData, home_radius_meters: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-2.5 py-1.5 text-xs text-[#57564F]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDDAD0] text-xs font-bold text-[#7A7A73] hover:bg-[#f9f8f3]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#57564F] text-[#F8F3CE] text-xs font-bold hover:bg-[#474640] shadow transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Akun Siswa */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#57564F]">Hapus Akun Siswa Ini?</h3>
              <p className="text-xs text-[#7A7A73] mt-1.5 leading-relaxed">
                Anda akan menghapus akun <b>{selectedStudent.name}</b> (NIS: {selectedStudent.nis}). Seluruh data riwayat absensi dan jurnal siswa ini juga akan ikut terhapus permanen.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#DDDAD0] text-xs font-bold text-[#7A7A73] hover:bg-[#f9f8f3]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: Riwayat Absen & Jurnal Siswa Tertentu */}
      {isHistoryModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.photo || '/default-avatar.png'}
                  alt={selectedStudent.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-[#DDDAD0]"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#57564F]">{selectedStudent.name}</h3>
                  <p className="text-[11px] text-[#7A7A73]">NIS: {selectedStudent.nis} &bull; {selectedStudent.tempat_pkl}</p>
                </div>
              </div>

              <button onClick={() => setIsHistoryModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switch: Attendance vs Activities */}
            <div className="flex bg-[#f9f8f3] p-1 rounded-xl border border-[#DDDAD0] text-xs font-bold">
              <button
                onClick={() => setHistoryTab('attendance')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  historyTab === 'attendance'
                    ? 'bg-[#57564F] text-[#F8F3CE] shadow-sm'
                    : 'text-[#7A7A73] hover:text-[#57564F]'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Riwayat Absen ({studentHistory?.attendance?.length || 0})
              </button>
              <button
                onClick={() => setHistoryTab('activities')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  historyTab === 'activities'
                    ? 'bg-[#57564F] text-[#F8F3CE] shadow-sm'
                    : 'text-[#7A7A73] hover:text-[#57564F]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Jurnal PKL ({studentHistory?.activities?.length || 0})
              </button>
            </div>

            {/* History Content */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#57564F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#7A7A73]">Mengambil riwayat siswa...</span>
                </div>
              ) : historyTab === 'attendance' ? (
                (studentHistory?.attendance || []).length === 0 ? (
                  <p className="text-xs text-[#7A7A73] text-center py-10">Siswa ini belum memiliki catatan kehadiran.</p>
                ) : (
                  <div className="space-y-2">
                    {studentHistory.attendance.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 bg-[#f9f8f3] rounded-2xl border border-[#DDDAD0] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#57564F]">{att.attendance_date}</span>
                            <span className="text-[11px] text-[#7A7A73]">{att.attendance_time} WIB</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              att.status === 'hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {att.work_mode ? att.work_mode.toUpperCase() : att.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7A7A73] block mt-0.5 line-clamp-1">{att.location || 'Lokasi terverifikasi'}</span>
                        </div>

                        <button
                          onClick={() => setSelectedAuditAttendance(att)}
                          className="text-[11px] font-bold text-[#57564F] hover:underline shrink-0 ml-2"
                        >
                          Audit Detail
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                (studentHistory?.activities || []).length === 0 ? (
                  <p className="text-xs text-[#7A7A73] text-center py-10">Siswa ini belum mengisi jurnal kegiatan.</p>
                ) : (
                  <div className="space-y-2.5">
                    {studentHistory.activities.map((act) => (
                      <div key={act.id} className="p-3.5 bg-[#f9f8f3] rounded-2xl border border-[#DDDAD0] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#57564F]">{act.title}</h4>
                          <span className="text-[10px] text-[#7A7A73] font-semibold">{act.activity_date}</span>
                        </div>
                        {(act.start_time || act.end_time) && (
                          <span className="text-[10px] text-[#7A7A73] block">{act.start_time || '-'} s/d {act.end_time || '-'} WIB</span>
                        )}
                        <p className="text-[11px] text-[#57564F]/90 leading-relaxed whitespace-pre-wrap">{act.description}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="pt-2 border-t border-[#DDDAD0]">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#57564F] text-[#F8F3CE] text-xs font-bold hover:bg-[#474640]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Modal Audit Absensi */}
      {selectedAuditAttendance && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDDAD0]">
              <h4 className="font-bold text-[#57564F]">Audit Foto & GPS Presensi</h4>
              <button onClick={() => setSelectedAuditAttendance(null)} className="p-1 text-[#7A7A73]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedAuditAttendance.photo && (
              <img
                src={selectedAuditAttendance.photo}
                alt="Bukti Presensi"
                className="w-full max-h-56 object-cover rounded-2xl border border-[#DDDAD0]"
              />
            )}

            <div className="bg-[#f9f8f3] p-3 rounded-2xl border border-[#DDDAD0] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Status:</span>
                <span className="font-bold text-[#57564F] uppercase">{selectedAuditAttendance.work_mode || selectedAuditAttendance.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7A73]">Koordinat:</span>
                <span className="font-mono text-[11px] text-[#57564F]">{selectedAuditAttendance.latitude}, {selectedAuditAttendance.longitude}</span>
              </div>
              <div className="pt-1">
                <span className="text-[#7A7A73] block mb-0.5">Alamat:</span>
                <span className="font-semibold text-[#57564F] leading-tight block">{selectedAuditAttendance.location}</span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${selectedAuditAttendance.latitude},${selectedAuditAttendance.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka di Google Maps
            </a>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
