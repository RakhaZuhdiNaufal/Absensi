'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

export default function AdminProfilPage() {
  const router = useRouter();
  const photoInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);

  const [bio, setBio] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [isEditBioOpen, setIsEditBioOpen] = useState(false);
  const [bioSaveError, setBioSaveError] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  const [tempEmail, setTempEmail] = useState('');
  const [tempJabatan, setTempJabatan] = useState('');
  const [tempInstansi, setTempInstansi] = useState('');
  const [tempSiswaBimbingan, setTempSiswaBimbingan] = useState('');
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [contactSaveError, setContactSaveError] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);

  const [tempUsername, setTempUsername] = useState('');
  const [tempName, setTempName] = useState('');
  const [isEditProfileInfoOpen, setIsEditProfileInfoOpen] = useState(false);
  const [profileInfoSaveError, setProfileInfoSaveError] = useState('');
  const [isSavingProfileInfo, setIsSavingProfileInfo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok || !data.success || data.user.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(data.user);
      setBio(data.user.bio || 'Pembimbing Praktik Kerja Lapangan (PKL) yang bertugas memantau kedisiplinan presensi, meninjau laporan jurnal aktivitas harian, serta memberikan penilaian dan bimbingan teknis berkala kepada siswa PKL di instansi mitra.');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(event.target.result);
      };
      reader.onerror = () => resolve(null);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const base64Photo = await compressImage(file);
      if (!base64Photo) {
        alert('Gagal membaca gambar');
        setIsUploadingPhoto(false);
        return;
      }
      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64Photo })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(prev => ({ ...prev, photo: base64Photo }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profilePhotoUpdated'));
        }
        alert('Foto profil Pembimbing berhasil diperbarui!');
      } else {
        alert(data.message || 'Gagal memperbarui foto profil.');
      }
      setIsUploadingPhoto(false);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunggah foto.');
      setIsUploadingPhoto(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setIsSubmittingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ type: 'success', text: 'Password berhasil diubah!' });
        setTimeout(() => {
          setIsEditPasswordOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordMsg(null);
        }, 1500);
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Gagal mengubah password.' });
      }
    } catch (err) {
      console.error(err);
      setPasswordMsg({ type: 'error', text: 'Terjadi kesalahan sistem.' });
      setIsSubmittingPass(false);
    }
  };

  const handleOpenEditBio = () => {
    setTempBio(bio);
    setBioSaveError('');
    setIsEditBioOpen(true);
  };

  const handleSaveBioModal = async (e) => {
    e?.preventDefault();
    setIsSavingBio(true);
    setBioSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: tempBio })
      });
      const data = await res.json();
      setIsSavingBio(false);
      if (res.ok && data.success) {
        setBio(tempBio);
        setUser(prev => ({ ...prev, bio: tempBio }));
        setIsEditBioOpen(false);
      } else {
        setBioSaveError(data.message || 'Gagal menyimpan biografi');
      }
    } catch (err) {
      setIsSavingBio(false);
      setBioSaveError('Terjadi kesalahan jaringan.');
    }
  };

  const handleOpenEditContact = () => {
    setTempEmail(user?.email || '');
    setTempJabatan(user?.jabatan || 'Pembimbing PKL Siswa');
    setTempInstansi(user?.instansi || 'Naikmarket');
    setTempSiswaBimbingan(user?.siswa_bimbingan || '6 Siswa PKL');
    setContactSaveError('');
    setIsEditContactOpen(true);
  };

  const handleSaveContactModal = async (e) => {
    e?.preventDefault();
    if (!tempEmail || !tempEmail.includes('@')) {
      setContactSaveError('Format email tidak valid');
      return;
    }
    if (!tempJabatan.trim()) {
      setContactSaveError('Jabatan tidak boleh kosong');
      return;
    }
    if (!tempInstansi.trim()) {
      setContactSaveError('Instansi tidak boleh kosong');
      return;
    }
    if (!tempSiswaBimbingan.trim()) {
      setContactSaveError('Siswa Bimbingan tidak boleh kosong');
      return;
    }
    setIsSavingContact(true);
    setContactSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tempEmail.trim(),
          jabatan: tempJabatan.trim(),
          instansi: tempInstansi.trim(),
          siswa_bimbingan: tempSiswaBimbingan.trim()
        })
      });
      const data = await res.json();
      setIsSavingContact(false);
      if (res.ok && data.success) {
        setUser(prev => ({
          ...prev,
          email: tempEmail.trim(),
          jabatan: tempJabatan.trim(),
          instansi: tempInstansi.trim(),
          siswa_bimbingan: tempSiswaBimbingan.trim()
        }));
        setIsEditContactOpen(false);
      } else {
        setContactSaveError(data.message || 'Gagal menyimpan data kontak');
      }
    } catch (err) {
      setIsSavingContact(false);
      setContactSaveError('Terjadi kesalahan jaringan.');
    }
  };

  const handleOpenEditProfileInfo = () => {
    setTempUsername(user?.username || '');
    setTempName(user?.name || '');
    setProfileInfoSaveError('');
    setIsEditProfileInfoOpen(true);
  };

  const handleSaveProfileInfoModal = async (e) => {
    e?.preventDefault();
    if (!tempUsername.trim()) {
      setProfileInfoSaveError('Username tidak boleh kosong');
      return;
    }
    if (!tempName.trim()) {
      setProfileInfoSaveError('Nama lengkap tidak boleh kosong');
      return;
    }
    setIsSavingProfileInfo(true);
    setProfileInfoSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: tempUsername.trim(),
          name: tempName.trim()
        })
      });
      const data = await res.json();
      setIsSavingProfileInfo(false);
      if (res.ok && data.success) {
        setUser(prev => ({
          ...prev,
          username: tempUsername.trim(),
          name: tempName.trim()
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profilePhotoUpdated'));
        }
        setIsEditProfileInfoOpen(false);
      } else {
        setProfileInfoSaveError(data.message || 'Gagal menyimpan data profil');
      }
    } catch (err) {
      setIsSavingProfileInfo(false);
      setProfileInfoSaveError('Terjadi kesalahan jaringan.');
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

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24">
      <TopNavbar />

      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="block md:hidden max-w-xl mx-auto p-4 space-y-4">

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#DDDAD0] space-y-4">
          <div className="text-center pb-4 border-b border-[#DDDAD0]">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative inline-block cursor-pointer group"
              title="Klik untuk ganti foto profil"
            >
              <img
                src={user?.photo || '/default-avatar.png'}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover border border-[#DDDAD0] shadow-md mx-auto group-hover:opacity-90 transition-opacity"
              />
              <div className="w-7 h-7 rounded-full bg-[#57564F] group-hover:bg-[#474640] border border-white absolute bottom-1 right-1 flex items-center justify-center text-[#F8F3CE] shadow-sm transition-transform active:scale-95">
                {isUploadingPhoto ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#F8F3CE] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Nama</span>
              <span className="font-normal text-[#57564F]">{user?.name}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Username</span>
              <span className="font-normal text-[#57564F]">{user?.username}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Jabatan</span>
              <span className="font-normal text-[#57564F]">Pembimbing PKL Siswa</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Status</span>
              <span className="font-normal text-[#57564F]">Aktif</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Instansi</span>
              <span className="font-normal text-[#57564F]">Naikmarket</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#7A7A73]">Siswa Bimbingan</span>
              <span className="font-normal text-[#57564F]">6 Siswa PKL</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] space-y-3 text-xs">
          <h3 className="text-xs font-normal text-[#57564F] uppercase tracking-wider mb-2 text-center">DETAIL AKUN LOGIN</h3>

          <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
            <span className="text-[#7A7A73]">Username</span>
            <span className="font-mono font-normal text-[#57564F]">{user?.username}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
            <span className="text-[#7A7A73]">Password</span>
            <span className="font-normal text-[#57564F]">••••••••</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
            <span className="text-[#7A7A73]">Role</span>
            <span className="font-normal text-[#57564F]">Admin</span>
          </div>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsEditPasswordOpen(true)}
              className="text-xs font-normal text-[#57564F] hover:underline"
            >
              Edit
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-normal py-3.5 px-4 rounded-3xl border border-[#DDDAD0] text-xs text-center transition-all shadow-md active:scale-98"
        >
          Log Out
        </button>
      </div>

      <div className="hidden md:block md:ml-64 p-6 lg:p-8">
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#DDDAD0] shadow-sm space-y-8 w-full">

          <div className="grid grid-cols-12 gap-8 lg:gap-10 items-start">

            <div className="col-span-12 lg:col-span-4 flex flex-col justify-between h-full space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#57564F] mb-4">Account Management</h2>
                <div className="flex flex-col items-center justify-center py-1">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="group cursor-pointer"
                    title="Klik untuk ganti foto profil"
                  >
                    <img
                      src={user?.photo || '/default-avatar.png'}
                      alt={user?.name}
                      className="w-32 h-32 rounded-full object-cover border-2 border-[#DDDAD0] shadow-md transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isUploadingPhoto ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#57564F] border-t-transparent rounded-full animate-spin" />
                    <span>Mengunggah Foto...</span>
                  </>
                ) : (
                  <span>Upload Photo</span>
                )}
              </button>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <h2 className="text-base font-bold text-[#57564F] mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Username</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm font-mono">
                    {user?.username}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Nama Lengkap</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                    {user?.name}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Role</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm flex items-center justify-between">
                    <span>Admin</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Pembimbing</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Status</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                    Aktif
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleOpenEditProfileInfo}
                  className="py-2.5 px-6 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm active:scale-98"
                >
                  Change Profile
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 lg:gap-10 items-start pt-2">

            <div className="col-span-12 lg:col-span-4">

              <div className="h-6 mb-4 hidden lg:block" aria-hidden="true" />

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A73] hover:text-[#57564F]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A73] hover:text-[#57564F]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-normal border ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {passwordMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingPass ? 'Menyimpan...' : 'Change Password'}
                </button>
              </form>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#57564F] mb-4">Contact Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Email</label>
                    <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                      {user?.email || 'pembimbing@sekolah.sch.id'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Jabatan</label>
                    <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                      {user?.jabatan || 'Pembimbing PKL Siswa'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Instansi</label>
                    <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                      {user?.instansi || 'Naikmarket'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Siswa Bimbingan</label>
                    <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                      {user?.siswa_bimbingan || '6 Siswa PKL'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={handleOpenEditContact}
                    className="py-2.5 px-6 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm active:scale-98"
                  >
                    Change Contact
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DDDAD0]/40 space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-[#57564F] mb-1.5">Biografi</h2>
              <div className="w-full bg-white border border-[#DDDAD0] rounded-xl p-4 text-xs text-[#57564F] leading-relaxed shadow-sm min-h-[96px] whitespace-pre-wrap">
                {bio || 'Belum ada biografi.'}
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={handleOpenEditBio}
                className="py-2.5 px-6 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm active:scale-98"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditPasswordOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#DDDAD0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-xs font-normal text-[#57564F]">Ubah Password Akun Pembimbing</h3>
              <button
                onClick={() => setIsEditPasswordOpen(false)}
                className="text-[#7A7A73] hover:text-[#57564F] p-1 rounded-full bg-[#f9f8f3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-normal text-[#7A7A73] mb-1">Password Saat Ini</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="w-full px-3 py-2 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-normal text-[#7A7A73] mb-1">Password Baru</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-normal text-[#7A7A73] mb-1">Konfirmasi Password Baru</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-3 py-2 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassText(!showPassText)}
                  className="text-xs text-[#7A7A73] hover:text-[#57564F] flex items-center gap-1 font-normal"
                >
                  {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassText ? 'Sembunyikan' : 'Tampilkan Teks'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPass}
                className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-normal py-3 px-4 rounded-2xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-2"
              >
                {isSubmittingPass ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditBioOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DDDAD0] space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DDDAD0]">
              <div>
                <h3 className="text-sm font-bold text-[#57564F]">Edit Biografi</h3>
                <p className="text-[11px] text-[#7A7A73] mt-0.5">Perbarui deskripsi biografi Pembimbing Anda</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBioOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBioModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Teks Biografi</label>
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  rows={6}
                  placeholder="Tuliskan biografi atau keterangan diri Anda..."
                  className="w-full bg-white border border-[#DDDAD0] rounded-xl p-4 text-xs text-[#57564F] leading-relaxed shadow-sm focus:outline-none focus:border-[#57564F] resize-y transition-colors"
                />
              </div>

              {bioSaveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-normal">
                  {bioSaveError}
                </div>
              )}

              <div className="pt-3 border-t border-[#DDDAD0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditBioOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingBio}
                  className="px-6 py-2.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingBio ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F8F3CE] border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditContactOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DDDAD0] space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DDDAD0]">
              <div>
                <h3 className="text-sm font-bold text-[#57564F]">Edit Contact Info</h3>
                <p className="text-[11px] text-[#7A7A73] mt-0.5">Perbarui rincian kontak dan instansi Pembimbing Anda</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditContactOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="pembimbing@sekolah.sch.id"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={tempJabatan}
                    onChange={(e) => setTempJabatan(e.target.value)}
                    placeholder="Contoh: Pembimbing PKL Siswa"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Instansi</label>
                  <input
                    type="text"
                    required
                    value={tempInstansi}
                    onChange={(e) => setTempInstansi(e.target.value)}
                    placeholder="Contoh: Naikmarket"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Siswa Bimbingan</label>
                  <input
                    type="text"
                    required
                    value={tempSiswaBimbingan}
                    onChange={(e) => setTempSiswaBimbingan(e.target.value)}
                    placeholder="Contoh: 6 Siswa PKL"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>
              </div>

              {contactSaveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-normal">
                  {contactSaveError}
                </div>
              )}

              <div className="pt-3 border-t border-[#DDDAD0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditContactOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="px-6 py-2.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingContact ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F8F3CE] border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditProfileInfoOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DDDAD0] space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DDDAD0]">
              <div>
                <h3 className="text-sm font-bold text-[#57564F]">Edit Informasi Profil</h3>
                <p className="text-[11px] text-[#7A7A73] mt-0.5">Perbarui username dan nama lengkap Anda</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileInfoOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileInfoModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                />
              </div>

              {profileInfoSaveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-normal">
                  {profileInfoSaveError}
                </div>
              )}

              <div className="pt-3 border-t border-[#DDDAD0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileInfoOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfileInfo}
                  className="px-6 py-2.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingProfileInfo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F8F3CE] border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
