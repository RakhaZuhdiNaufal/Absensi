'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/admin');
    router.prefetch('/superadmin');
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert('Password atau nama anda salah');
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
      alert('Password atau nama anda salah');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-3 sm:p-6 md:p-10 selection:bg-[#57564F] selection:text-[#F8F3CE]">
      {/* Container Utama Berbentuk Card Besar dengan Split View */}
      <div className="w-full max-w-4xl min-h-[580px] bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-[#57564F]/10 border border-[#DDDAD0] overflow-hidden flex flex-col md:flex-row relative">

        {/* Kolom Kiri: Visual Artistik Lengkungan dengan Tema Aplikasi (#57564F / #474640 / #F8F3CE) */}
        <div className="relative w-full md:w-1/2 min-h-[220px] md:min-h-[580px] bg-gradient-to-br from-[#57564F] via-[#4d4c45] to-[#3a3934] overflow-hidden flex flex-col justify-between p-7 sm:p-10 text-[#F8F3CE] select-none">
          
          {/* Efek Lingkaran/Kurva Latar Artistik */}
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Lengkungan Sisi Kanan Khusus Desktop (Curved divider) */}
          <div 
            className="hidden md:block absolute -top-12 -bottom-12 -right-24 w-52 bg-white rounded-[100%] shadow-[-10px_0_25px_rgba(0,0,0,0.08)] pointer-events-none z-10" 
          />

          {/* Logo & Brand Header Kiri */}
          <div className="relative z-20 flex items-center">
            <span className="group font-bold text-base tracking-wide text-[#F8F3CE] drop-shadow-sm cursor-pointer relative py-1">
              Absensi PKL
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#F8F3CE] rounded-full transition-all duration-300 ease-out group-hover:w-full shadow-sm" />
            </span>
          </div>

          {/* Headline Sambutan Kiri */}
          <div className="relative z-20 my-auto py-6 md:py-0 pr-0 md:pr-6">
            <h1 className="text-2xl sm:text-3xl md:text-[32px] font-black leading-tight tracking-tight text-[#F8F3CE] drop-shadow-sm">
              Selamat datang di <br />
              <span className="text-white">portal absensi</span>
            </h1>
          </div>

          {/* Footer Kiri */}
          <div className="relative z-20 text-[11px] text-[#DDDAD0]/70 font-medium">
            &copy; {new Date().getFullYear()} Website Absensi PKL.
          </div>
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="w-full md:w-1/2 bg-white p-7 sm:p-12 md:pl-16 flex flex-col justify-center relative z-20">
          
          {/* Avatar Icon di bagian atas form */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-16 h-16 rounded-full bg-[#f9f8f3] border border-[#DDDAD0] flex items-center justify-center text-[#7A7A73] shadow-inner mb-3">
              <User className="w-8 h-8" />
            </div>
            <p className="text-xs text-[#7A7A73] font-normal">
              Login below to get started.
            </p>
          </div>

          {/* Form Pengisian */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input NIPD / Username / Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A7A73]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="E-mail Address / NIPD"
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-[#57564F] placeholder-[#7A7A73]/70 focus:bg-white focus:outline-none focus:border-[#57564F] focus:ring-2 focus:ring-[#57564F]/20 transition-all shadow-xs"
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A7A73]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Password"
                className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-2xl pl-11 pr-11 py-3.5 text-xs text-[#57564F] placeholder-[#7A7A73]/70 focus:bg-white focus:outline-none focus:border-[#57564F] focus:ring-2 focus:ring-[#57564F]/20 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7A7A73] hover:text-[#57564F] transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Tombol Login Pill dengan tema aplikasi */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold text-xs shadow-lg shadow-[#57564F]/25 hover:shadow-xl hover:shadow-[#57564F]/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#DDDAD0] border-t-[#F8F3CE] rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Footer Bawah Form */}
          <div className="mt-8 text-center text-xs text-[#7A7A73]">
            Butuh bantuan akun? <span className="text-[#57564F] font-bold hover:underline cursor-pointer">Hubungi Admin</span>
          </div>

        </div>

      </div>
    </div>
  );
}
