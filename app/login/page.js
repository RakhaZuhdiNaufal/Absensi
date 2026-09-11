'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/admin');
    router.prefetch('/superadmin');
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Login gagal. Silakan periksa kembali NIPD atau password Anda.');
        setIsLoading(false);
        return;
      }

      const role = data.user.role;
      if (role === 'super_admin') {
        window.location.href = '/superadmin';
      } else if (role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setErrorMsg('Koneksi bermasalah. Silakan coba beberapa saat lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] flex flex-col justify-between p-4 sm:p-8 relative">

      <div className="max-w-md w-full mx-auto text-center pt-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#57564F] text-[#F8F3CE] shadow-lg mb-3 ring-4 ring-[#DDDAD0]">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#57564F]">ABSENSI SISWA PKL</h1>
        <p className="text-[#7A7A73] text-xs sm:text-sm font-medium mt-1">Sistem Kehadiran & Aktivitas Praktik Kerja Lapangan</p>
      </div>

      <div className="w-full max-w-md mx-auto bg-white border-2 border-[#DDDAD0] rounded-3xl p-6 sm:p-8 shadow-xl my-6">
        <h2 className="text-lg font-bold text-[#57564F] text-center mb-1">Masuk ke Akun Anda</h2>
        <p className="text-[#7A7A73] text-xs text-center mb-6">Gunakan NIPD dan password Anda</p>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-[#f9f8f3] border border-[#DDDAD0] rounded-2xl text-[#57564F] text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#57564F] mb-1.5">NIPD / Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#7A7A73] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="Masukkan NIPD / Username"
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-10 pr-4 py-3 text-sm text-[#57564F] placeholder-[#7A7A73]/70 focus:outline-none focus:border-[#57564F] focus:ring-1 focus:ring-[#57564F] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57564F] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A7A73] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl pl-10 pr-11 py-3 text-sm text-[#57564F] placeholder-[#7A7A73]/70 focus:outline-none focus:border-[#57564F] focus:ring-1 focus:ring-[#57564F] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-0.5 text-[#7A7A73] hover:text-[#57564F] transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#DDDAD0] border-t-[#F8F3CE] rounded-full animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pb-4 text-center text-[#7A7A73] text-xs">
        &copy; {new Date().getFullYear()} Aplikasi Absensi Siswa PKL Sekolah
      </div>
    </div>
  );
}
