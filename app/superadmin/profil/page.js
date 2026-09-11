'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import BottomNav from '@/components/BottomNav';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Save,
  KeyRound
} from 'lucide-react';

export default function SuperAdminProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok || !data.success || data.user.role !== 'super_admin') {
        router.push('/login');
        return;
      }
      setUser(data.user);
      setName(data.user.name || '');
      setUsername(data.user.username || '');
      setEmail(data.user.email || '');
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMsg({ type: 'success', text: 'Profil Super Admin berhasil disimpan!' });
        setUser({ ...user, name, username, email });
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Gagal menyimpan profil.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password baru minimal 6 karakter!' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
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
        setPasswordMsg({ type: 'success', text: 'Password Super Admin berhasil diperbarui!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Gagal mengganti password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#7A7A73]">Memuat profil super admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-12">
      <TopNavbar />

      <div className="md:ml-64">
        {/* Top Header Banner */}
        <div className="max-w-4xl mx-auto md:max-w-none md:px-6 md:pt-4">
          <div className="bg-[#57564F] text-[#F8F3CE] p-6 sm:rounded-3xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F8F3CE] text-2xl font-black">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-xs text-[#DDDAD0] font-semibold flex items-center gap-1.5 uppercase tracking-wider mb-1">
                    Akun Otoritas Tertinggi
                  </span>
                  <h1 className="text-2xl font-black text-[#F8F3CE] leading-tight">{user?.name}</h1>
                  <p className="text-xs text-[#DDDAD0]/80 mt-0.5">Role: Super Administrator &bull; @{user?.username}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto md:max-w-none p-4 md:p-6 space-y-6">

          {/* Form Edit Info Akun */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#DDDAD0] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DDDAD0]/70">
              <User className="w-4 h-4 text-[#57564F]" />
              <h2 className="text-sm font-bold text-[#57564F] uppercase tracking-wider">Informasi Kredensial</h2>
            </div>

            {profileMsg && (
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#57564F] mb-1">Nama Tampilan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] font-semibold focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] font-semibold focus:outline-none focus:border-[#57564F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Email Resmi</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] font-semibold focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {isSavingProfile ? 'Menyimpan...' : 'Perbarui Profil'}
                </button>
              </div>
            </form>
          </div>

          {/* Form Ganti Password */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#DDDAD0] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DDDAD0]/70">
              <KeyRound className="w-4 h-4 text-[#57564F]" />
              <h2 className="text-sm font-bold text-[#57564F] uppercase tracking-wider">Keamanan & Ganti Password</h2>
            </div>

            {passwordMsg && (
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPassText ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassText(!showPassText)}
                      className="absolute right-3 top-3 text-[#7A7A73] hover:text-[#57564F]"
                    >
                      {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#57564F] mb-1">Ulangi Password Baru</label>
                  <input
                    type={showPassText ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3.5 py-2.5 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" /> {isSubmittingPass ? 'Mengganti...' : 'Ganti Password Super Admin'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
