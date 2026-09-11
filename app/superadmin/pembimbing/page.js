'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  UserCog,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building,
  Briefcase,
  Mail,
  UserCheck,
  Calendar,
  Users
} from 'lucide-react';

export default function SuperAdminPembimbingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    instansi: '',
    jabatan: '',
    bio: ''
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

      await reloadMentors();
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const reloadMentors = async () => {
    const res = await fetch('/api/superadmin/mentors');
    const data = await res.json();
    if (data.success) {
      setMentors(data.mentors || []);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: 'password123',
      instansi: 'Naikmarket',
      jabatan: 'Pembimbing PKL Siswa',
      bio: ''
    });
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mentor) => {
    setSelectedMentor(mentor);
    setFormData({
      mentorId: mentor.id,
      name: mentor.name || '',
      username: mentor.username || '',
      email: mentor.email || '',
      password: '',
      instansi: mentor.instansi || '',
      jabatan: mentor.jabatan || '',
      bio: mentor.bio || ''
    });
    setFormError('');
    setFormSuccess('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (mentor) => {
    setSelectedMentor(mentor);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/superadmin/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Gagal menambahkan pembimbing.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess('Pembimbing baru berhasil ditambahkan!');
      await reloadMentors();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsSubmitting(false);
      }, 700);
    } catch (err) {
      setFormError('Terjadi kesalahan: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/superadmin/mentors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Gagal memperbarui profil pembimbing.');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess('Profil pembimbing berhasil diperbarui!');
      await reloadMentors();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setIsSubmitting(false);
      }, 700);
    } catch (err) {
      setFormError('Terjadi kesalahan: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedMentor) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/superadmin/mentors?mentorId=${selectedMentor.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Gagal menghapus akun pembimbing.');
        setIsSubmitting(false);
        return;
      }

      await reloadMentors();
      setIsDeleteModalOpen(false);
      setIsSubmitting(false);
      setSelectedMentor(null);
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.username || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.instansi || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A73]">Memuat data pembimbing...</p>
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
                  <UserCog className="w-4 h-4 text-[#F8F3CE]" /> Super Admin Panel
                </span>
                <h1 className="text-2xl font-black text-[#F8F3CE] leading-tight">
                  Manajemen Pembimbing & Admin PKL
                </h1>
                <p className="text-xs text-[#DDDAD0]/80 mt-1">
                  Kelola akun pembimbing lapangan, instansi mitra, dan penetapan siswa bimbingan.
                </p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="bg-[#F8F3CE] hover:bg-white text-[#57564F] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Pembimbing Baru
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-6xl mx-auto md:max-w-none p-4 md:p-6 space-y-4">

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0] flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A7A73] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pembimbing, @username, email, atau instansi..."
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
              />
            </div>
            <span className="text-xs font-bold text-[#7A7A73] shrink-0">
              Total: {filteredMentors.length} Pembimbing
            </span>
          </div>

          {/* Mentors Grid */}
          {filteredMentors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#DDDAD0] space-y-3">
              <UserCog className="w-10 h-10 text-[#7A7A73] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#57564F]">Belum Ada Data Pembimbing Cocok</h3>
              <p className="text-xs text-[#7A7A73]">Silakan tambah akun pembimbing baru untuk mengawasi siswa PKL.</p>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 bg-[#57564F] text-[#F8F3CE] text-xs font-bold px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" /> Tambah Pembimbing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] hover:border-[#57564F]/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={mentor.photo || '/default-avatar.png'}
                          alt={mentor.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#DDDAD0] shrink-0"
                        />
                        <div className="truncate">
                          <h3 className="font-bold text-sm text-[#57564F] truncate group-hover:text-black">
                            {mentor.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-[#7A7A73] block truncate">
                            @{mentor.username}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(mentor)}
                          title="Otak-atik Profil Pembimbing"
                          className="p-1.5 rounded-lg bg-[#f9f8f3] hover:bg-[#57564F] hover:text-[#F8F3CE] text-[#57564F] transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(mentor)}
                          title="Hapus Akun Pembimbing"
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
                        <span className="font-medium truncate">{mentor.instansi || 'Naikmarket'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7A7A73]">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{mentor.jabatan || 'Pembimbing PKL Siswa'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7A7A73]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{mentor.email}</span>
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="mt-2.5 text-[11px] text-[#7A7A73] line-clamp-2 italic bg-[#f9f8f3] p-2 rounded-xl border border-[#DDDAD0]/50">
                        &ldquo;{mentor.bio}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Card bottom */}
                  <div className="pt-3 border-t border-[#DDDAD0]/70 flex items-center justify-between">
                    <span className="bg-[#F8F3CE] text-[#57564F] border border-[#DDDAD0] font-bold text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {mentor.total_bimbingan || 0} Siswa Bimbingan
                    </span>

                    <button
                      onClick={() => handleOpenEdit(mentor)}
                      className="text-xs font-bold text-[#57564F] hover:underline"
                    >
                      Ubah Profil &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODAL: Tambah Pembimbing Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center">
                  <UserCog className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#57564F]">Tambah Akun Pembimbing / Admin</h3>
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
                <label className="block font-bold text-[#57564F] mb-1">Nama Lengkap Pembimbing *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pak Ridwan"
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: Ridwan"
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
                    placeholder="Default: password123"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Email Resmi *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="pembimbing@sekolah.sch.id"
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Instansi / Perusahaan</label>
                  <input
                    type="text"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    placeholder="Contoh: Naikmarket"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Pembimbing PKL Siswa"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Deskripsi Singkat / Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tuliskan catatan peran atau informasi pembimbing..."
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl p-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pembimbing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Otak-atik Profil Pembimbing (Edit) */}
      {isEditModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#57564F]/10 text-[#57564F] flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#57564F]">Otak-atik Profil Pembimbing</h3>
                  <span className="text-[11px] text-[#7A7A73]">ID: #{selectedMentor.id} &bull; {selectedMentor.name}</span>
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
                <label className="block font-bold text-[#57564F] mb-1">Nama Lengkap Pembimbing</label>
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
                  <label className="block font-bold text-[#57564F] mb-1">Username Login</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Instansi</label>
                  <input
                    type="text"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57564F] mb-1">Bio / Keterangan</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl p-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
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

      {/* MODAL: Konfirmasi Hapus Pembimbing */}
      {isDeleteModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#57564F]">Hapus Akun Pembimbing?</h3>
              <p className="text-xs text-[#7A7A73] mt-1.5 leading-relaxed">
                Anda akan menghapus akun <b>{selectedMentor.name}</b> (@{selectedMentor.username}).
                {selectedMentor.total_bimbingan > 0 ? (
                  <span className="block mt-1 text-rose-600 font-semibold">
                    Perhatian: Terdapat {selectedMentor.total_bimbingan} siswa bimbingan yang terhubung. Relasi pembimbing siswa tersebut akan dilepas.
                  </span>
                ) : null}
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

      <BottomNav />
    </div>
  );
}
