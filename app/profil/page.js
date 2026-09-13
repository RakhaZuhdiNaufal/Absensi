'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import TopNavbar from '@/components/TopNavbar';
import { User, Camera, X, ChevronLeft, Eye, EyeOff } from 'lucide-react';

export default function ProfilPage() {
  const router = useRouter();
  const photoInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [contactEmail, setContactEmail] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [contactPerusahaan, setContactPerusahaan] = useState('');
  const [contactPembimbing, setContactPembimbing] = useState('');
  const [bio, setBio] = useState('');
  const [alamatRumah, setAlamatRumah] = useState('');
  const [alamatPkl, setAlamatPkl] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAlamatRumah, setTempAlamatRumah] = useState('');
  const [tempAlamatPkl, setTempAlamatPkl] = useState('');
  const [addressSaveMsg, setAddressSaveMsg] = useState('');
  const [addressSaveError, setAddressSaveError] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState('');
  const [profileSaveError, setProfileSaveError] = useState('');

  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempClass, setTempClass] = useState('');
  const [tempNis, setTempNis] = useState('');
  const [tempMajor, setTempMajor] = useState('');
  const [tempContactEmail, setTempContactEmail] = useState('');
  const [tempContactStatus, setTempContactStatus] = useState('');
  const [tempContactPerusahaan, setTempContactPerusahaan] = useState('');
  const [tempContactPembimbing, setTempContactPembimbing] = useState('');
  const [contactSaveError, setContactSaveError] = useState('');

  const [isEditBioOpen, setIsEditBioOpen] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [bioSaveError, setBioSaveError] = useState('');

  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const handleOpenEditContact = () => {
    if (student?.profile_updated == 1) {
      alert('profil hanya bisa dilakukan 1 kali, segera hubungi admin');
      return;
    }
    setTempName(user?.name || '');
    setTempClass(student?.class || 'XII RPL 1');
    setTempNis(student?.nis || user?.username || '');
    setTempMajor(student?.major || 'Rekayasa Perangkat Lunak');
    setTempContactEmail(contactEmail || user?.email || '');
    setTempContactStatus(contactStatus || student?.status || 'Aktif PKL');
    setTempContactPerusahaan(contactPerusahaan || student?.tempat_pkl || '');
    setTempContactPembimbing(contactPembimbing || student?.pembimbing_name || '');
    setTempAlamatRumah(alamatRumah || student?.alamat_rumah || '');
    setTempAlamatPkl(alamatPkl || student?.alamat_pkl || '');
    setTempBio(bio || student?.bio || '');
    setContactSaveError('');
    setIsEditContactOpen(true);
  };

  const handleSaveContactModal = async (e) => {
    e?.preventDefault();
    setIsSavingProfile(true);
    setContactSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempName,
          class: tempClass,
          nis: tempNis,
          major: tempMajor,
          email: tempContactEmail,
          status: tempContactStatus,
          tempat_pkl: tempContactPerusahaan,
          pembimbing_name: tempContactPembimbing,
          alamat_rumah: tempAlamatRumah,
          alamat_pkl: tempAlamatPkl,
          bio: tempBio
        })
      });
      const data = await res.json();
      setIsSavingProfile(false);
      if (res.ok && data.success) {
        setUser(prev => ({ ...prev, name: tempName, email: tempContactEmail }));
        setStudent(prev => ({
          ...prev,
          name: tempName,
          class: tempClass,
          nis: tempNis,
          major: tempMajor,
          status: tempContactStatus,
          tempat_pkl: tempContactPerusahaan,
          pembimbing_name: tempContactPembimbing,
          alamat_rumah: tempAlamatRumah,
          alamat_pkl: tempAlamatPkl,
          bio: tempBio,
          profile_updated: 1
        }));
        setContactEmail(tempContactEmail);
        setContactStatus(tempContactStatus);
        setContactPerusahaan(tempContactPerusahaan);
        setContactPembimbing(tempContactPembimbing);
        setAlamatRumah(tempAlamatRumah);
        setAlamatPkl(tempAlamatPkl);
        setBio(tempBio);
        setIsEditContactOpen(false);
      } else {
        setContactSaveError(data.message || 'Gagal menyimpan kontak');
      }
    } catch (err) {
      setIsSavingProfile(false);
      setContactSaveError('Terjadi kesalahan jaringan.');
    }
  };

  const handleOpenEditBio = () => {
    if (student?.profile_updated == 1) {
      alert('profil hanya bisa dilakukan 1 kali, segera hubungi admin');
      return;
    }
    setTempBio(bio);
    setBioSaveError('');
    setIsEditBioOpen(true);
  };

  const handleSaveBioModal = async (e) => {
    e?.preventDefault();
    if (student?.profile_updated == 1) {
      alert('profil hanya bisa dilakukan 1 kali, segera hubungi admin');
      setIsEditBioOpen(false);
      return;
    }
    setIsSavingProfile(true);
    setBioSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactEmail,
          status: contactStatus,
          tempat_pkl: contactPerusahaan,
          pembimbing_name: contactPembimbing,
          bio: tempBio
        })
      });
      const data = await res.json();
      setIsSavingProfile(false);
      if (res.ok && data.success) {
        setBio(tempBio);
        setStudent(prev => ({ ...prev, bio: tempBio, profile_updated: 1 }));
        setIsEditBioOpen(false);
      } else {
        setBioSaveError(data.message || 'Gagal menyimpan biografi');
      }
    } catch (err) {
      setIsSavingProfile(false);
      setBioSaveError('Terjadi kesalahan jaringan.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success) {
        router.push('/login');
        return;
      }
      if (meData.user.role === 'admin') {
        router.push('/admin/profil');
        return;
      }
      const s = meData.student || {};
      const u = meData.user || {};
      setUser(u);
      setStudent(s);
      setContactEmail(u.email || (u.username ? `${u.username}@sekolah.sch.id` : ''));
      setContactStatus(s.status || 'Aktif PKL');
      setContactPerusahaan(s.tempat_pkl || '');
      setContactPembimbing(s.pembimbing_name || '');
      setBio(s.bio || '');
      setAlamatRumah(s.alamat_rumah || '');
      setAlamatPkl(s.alamat_pkl || '');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e?.preventDefault();
    if (student?.profile_updated == 1) {
      alert('profil hanya bisa dilakukan 1 kali, segera hubungi admin');
      setIsEditingAddress(false);
      return;
    }
    setIsSavingAddress(true);
    setAddressSaveMsg('');
    setAddressSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alamat_rumah: tempAlamatRumah,
          alamat_pkl: tempAlamatPkl
        })
      });
      const data = await res.json();
      setIsSavingAddress(false);
      if (res.ok && data.success) {
        setAlamatRumah(tempAlamatRumah);
        setAlamatPkl(tempAlamatPkl);
        setStudent(prev => ({
          ...prev,
          alamat_rumah: tempAlamatRumah,
          alamat_pkl: tempAlamatPkl,
          profile_updated: 1
        }));
        setIsEditingAddress(false);
        setAddressSaveMsg('Alamat berhasil diperbarui!');
        setTimeout(() => setAddressSaveMsg(''), 2500);
      } else {
        setAddressSaveError(data.message || 'Gagal menyimpan alamat');
      }
    } catch (err) {
      setIsSavingAddress(false);
      setAddressSaveError('Terjadi kesalahan jaringan.');
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (student?.profile_updated == 1) {
      alert('profil hanya bisa dilakukan 1 kali, segera hubungi admin');
      return;
    }
    setIsSavingProfile(true);
    setProfileSaveMsg('');
    setProfileSaveError('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactEmail,
          status: contactStatus,
          tempat_pkl: contactPerusahaan,
          pembimbing_name: contactPembimbing,
          bio
        })
      });
      const data = await res.json();
      setIsSavingProfile(false);
      if (res.ok && data.success) {
        setProfileSaveMsg('Profil berhasil disimpan!');
        setUser(prev => ({ ...prev, email: contactEmail }));
        setStudent(prev => ({
          ...prev,
          status: contactStatus,
          tempat_pkl: contactPerusahaan,
          pembimbing_name: contactPembimbing,
          bio,
          profile_updated: 1
        }));
        setTimeout(() => setProfileSaveMsg(''), 2500);
      } else {
        setProfileSaveError(data.message || 'Gagal menyimpan profil');
      }
    } catch (err) {
      setIsSavingProfile(false);
      setProfileSaveError('Terjadi kesalahan jaringan.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Photo = reader.result;
      try {
        const res = await fetch('/api/profile/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: base64Photo })
        });
        const data = await res.json();
        setIsUploadingPhoto(false);
        if (res.ok && data.success) {
          setUser(prev => ({ ...prev, photo: base64Photo }));
        } else {
          alert(data.message || 'Gagal mengubah foto profil');
        }
      } catch (err) {
        setIsUploadingPhoto(false);
        alert('Terjadi kesalahan jaringan.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');

    if (newPassword.length < 4) {
      setPwdError('Password minimal 4 karakter!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Konfirmasi password tidak cocok!');
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      setPwdSubmitting(false);

      if (res.ok && data.success) {
        setPwdMsg('Password berhasil diubah!');
        setTimeout(() => {
          setIsEditPasswordOpen(false);
          setNewPassword('');
          setConfirmPassword('');
          setPwdMsg('');
        }, 1500);
      } else {
        setPwdError(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setPwdSubmitting(false);
      setPwdError('Terjadi kesalahan jaringan.');
    }
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

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-8">
      <TopNavbar />

      <input
        type="file"
        accept="image/*"
        ref={photoInputRef}
        onChange={handlePhotoUpload}
        className="hidden"
      />

      <div className="block md:hidden max-w-xl mx-auto p-4 space-y-4">

        <div className="bg-white rounded-3xl p-5 pb-3 shadow-sm border border-[#DDDAD0] space-y-3">
          <div className="text-center pb-3 border-b border-[#DDDAD0]">
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
              <span className="text-[#7A7A73]">Kelas</span>
              <span className="font-normal text-[#57564F]">{student?.class || 'XII RPL 1'}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">NIPD</span>
              <span className="font-normal text-[#57564F]">{student?.nis || user?.username}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Jurusan</span>
              <span className="font-normal text-[#57564F]">{student?.major || 'Rekayasa Perangkat Lunak'}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Status</span>
              <span className="font-normal text-[#57564F]">Aktif PKL</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Perusahaan</span>
              <span className="font-normal text-[#57564F]">{student?.tempat_pkl || contactPerusahaan || 'Belum diatur'}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Alamat 1 (PKL)</span>
              <span className="font-normal text-[#57564F] text-right max-w-[60%] truncate" title={alamatPkl}>
                {alamatPkl || 'Belum diatur'} ({student?.radius_meters || 50}m)
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
              <span className="text-[#7A7A73]">Alamat 2 (Alternatif)</span>
              <span className="font-normal text-[#57564F] text-right max-w-[60%] truncate" title={alamatRumah}>
                {alamatRumah || 'Belum diatur'} ({student?.home_radius_meters || student?.radius_meters || 50}m)
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-0.5 -mt-1">
            <button
              type="button"
              onClick={handleOpenEditContact}
              className="text-xs font-normal text-[#57564F] hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 pb-3 shadow-sm border border-[#DDDAD0] space-y-2.5 text-xs">
          <h3 className="text-xs font-normal text-[#57564F] uppercase tracking-wider mb-1.5">DETAIL AKUN LOGIN</h3>

          <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
            <span className="text-[#7A7A73]">Username</span>
            <span className="font-mono font-normal text-[#57564F]">{user?.username}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#DDDAD0]">
            <span className="text-[#7A7A73]">Password</span>
            <span className="font-normal text-[#57564F]">••••••••</span>
          </div>

          <div className="flex justify-center pt-0.5 -mt-1">
            <button
              type="button"
              onClick={() => setIsEditPasswordOpen(true)}
              className="text-xs font-normal text-[#57564F] hover:underline cursor-pointer"
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

            <div className="col-span-12 lg:col-span-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="p-1 -ml-1 rounded-xl text-[#57564F] hover:bg-[#f9f8f3] border border-transparent hover:border-[#DDDAD0] transition-all active:scale-95 flex items-center justify-center shrink-0"
                    title="Kembali"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <h2 className="text-base font-bold text-[#57564F]">Account Management</h2>
                </div>
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

              <div className="mt-4 lg:mt-[30px]">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="w-full h-[38px] px-3.5 bg-white hover:bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
              <div className="pt-3 border-t border-[#DDDAD0] mt-4">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#57564F] mb-2">
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

                  {pwdError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-normal">
                      ⚠️ {pwdError}
                    </div>
                  )}

                  {pwdMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-normal">
                      ✅ {pwdMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwdSubmitting}
                    className="w-full py-2.5 px-6 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {pwdSubmitting ? 'Menyimpan...' : 'Change Password'}
                  </button>
                </form>
              </div>
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
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">NIPD / NIS</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                    {student?.nis || user?.username}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Role</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                    Siswa PKL
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Kelas</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                    {student?.class || 'XII RPL 1'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Jurusan</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm">
                    {student?.major || 'Rekayasa Perangkat Lunak'}
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 pt-3 border-t border-[#DDDAD0]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Alamat WFO</label>
                      <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] leading-relaxed shadow-sm min-h-[58px]">
                        {alamatPkl || student?.alamat_pkl || 'Belum diatur'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Alamat Rumah</label>
                      <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] leading-relaxed shadow-sm min-h-[58px]">
                        {alamatRumah || student?.alamat_rumah || 'Belum diatur'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#DDDAD0] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#57564F]">Contact Info</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Email</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm truncate" title={contactEmail || user?.email}>
                    {contactEmail || user?.email || 'Belum diatur'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Status</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm truncate">
                    {contactStatus || student?.status || 'Aktif PKL'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Perusahaan</label>
                  <div className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] shadow-sm truncate" title={contactPerusahaan || student?.tempat_pkl}>
                    {contactPerusahaan || student?.tempat_pkl || 'Belum diatur'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Biografi</label>
              <div className="w-full bg-white border border-[#DDDAD0] rounded-xl p-3.5 text-xs text-[#57564F] leading-relaxed shadow-sm min-h-[60px] whitespace-pre-line">
                {bio || student?.bio || 'Belum ada biografi diri.'}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenEditContact}
                className="py-2.5 px-6 bg-white hover:bg-[#57564F] hover:text-[#F8F3CE] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-2"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditPasswordOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#DDDAD0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0]">
              <h3 className="text-xs font-normal text-[#57564F]">Ubah Password Akun</h3>
              <button
                onClick={() => {
                  setIsEditPasswordOpen(false);
                  setPwdError('');
                  setPwdMsg('');
                }}
                className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-normal text-[#57564F] mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password baru..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2.5 pr-10 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
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
                <label className="block text-xs font-normal text-[#57564F] mb-1">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ketik ulang password baru..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2.5 pr-10 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
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

              {pwdError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-normal">
                  ⚠️ {pwdError}
                </div>
              )}

              {pwdMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-normal">
                  ✅ {pwdMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditPasswordOpen(false)}
                  className="flex-1 bg-[#f9f8f3] hover:bg-[#DDDAD0]/40 text-[#57564F] font-normal py-2.5 rounded-xl border border-[#DDDAD0] text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="flex-1 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-normal py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-98 disabled:opacity-50"
                >
                  {pwdSubmitting ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditContactOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DDDAD0] space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DDDAD0] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#57564F]">Edit Data Profil</h3>
                <p className="text-[11px] text-[#7A7A73] mt-0.5">Perbarui data diri, sekolah, dan tempat PKL Anda</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditContactOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactModal} className="space-y-4 text-xs overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Nama</label>
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Kelas</label>
                  <input
                    type="text"
                    required
                    value={tempClass}
                    onChange={(e) => setTempClass(e.target.value)}
                    placeholder="Contoh: XII RPL 1"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">NIPD</label>
                  <input
                    type="text"
                    required
                    value={tempNis}
                    onChange={(e) => setTempNis(e.target.value)}
                    placeholder="Nomor Induk Siswa"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Jurusan</label>
                  <input
                    type="text"
                    required
                    value={tempMajor}
                    onChange={(e) => setTempMajor(e.target.value)}
                    placeholder="Jurusan"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Status</label>
                  <input
                    type="text"
                    value={tempContactStatus}
                    onChange={(e) => setTempContactStatus(e.target.value)}
                    placeholder="Aktif PKL"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Perusahaan</label>
                  <input
                    type="text"
                    value={tempContactPerusahaan}
                    onChange={(e) => setTempContactPerusahaan(e.target.value)}
                    placeholder="Nama Perusahaan"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={tempContactEmail}
                    onChange={(e) => setTempContactEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Pembimbing PKL</label>
                  <input
                    type="text"
                    value={tempContactPembimbing}
                    onChange={(e) => setTempContactPembimbing(e.target.value)}
                    placeholder="Nama Pembimbing"
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Biografi Diri</label>
                  <textarea
                    rows={3}
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    placeholder="Tuliskan biografi atau keterangan diri..."
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Alamat Rumah</label>
                  <textarea
                    rows={2}
                    value={tempAlamatRumah}
                    onChange={(e) => setTempAlamatRumah(e.target.value)}
                    placeholder="Alamat Rumah..."
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#57564F] mb-1.5">Alamat WFO</label>
                  <textarea
                    rows={2}
                    value={tempAlamatPkl}
                    onChange={(e) => setTempAlamatPkl(e.target.value)}
                    placeholder="Alamat PKL..."
                    className="w-full bg-white border border-[#DDDAD0] rounded-xl px-3.5 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] shadow-sm transition-colors resize-none"
                  />
                </div>
              </div>

              {contactSaveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-normal">
                  {contactSaveError}
                </div>
              )}

              <div className="pt-3 border-t border-[#DDDAD0] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditContactOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-xs font-semibold text-[#57564F] transition-all shadow-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#F8F3CE] border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
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
                <p className="text-[11px] text-[#7A7A73] mt-0.5">Perbarui deskripsi diri dan kegiatan PKL Anda</p>
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
                  ⚠️ {bioSaveError}
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
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingProfile ? (
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
