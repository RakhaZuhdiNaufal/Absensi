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
      if (role === 'super_admin' || role === 'admin') {
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
    <div className="min-h-screen w-full bg-[#f9f8f3] text-[#57564F] flex items-center justify-center p-0 md:p-10 selection:bg-[#57564F] selection:text-[#F8F3CE]">
      {/* Container Utama: Di mobile full-screen bottom-sheet style, di desktop card split-view */}
      <div className="w-full max-w-4xl min-h-screen md:min-h-[580px] bg-white md:rounded-[36px] md:shadow-2xl md:shadow-[#57564F]/10 md:border md:border-[#DDDAD0] overflow-hidden flex flex-col md:flex-row relative">

        {/* Kolom/Header Visual Artistik: Di mobile jadi hero header atas dengan kurva bulat, di desktop jadi sisi kiri */}
        <div className="relative w-full md:w-1/2 h-64 sm:h-72 md:h-auto md:min-h-[580px] bg-gradient-to-br from-[#57564F] via-[#4d4c45] to-[#3a3934] overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-10 text-[#F8F3CE] select-none shrink-0">
          
          {/* Efek Lingkaran/Kurva Artistik seperti referensi */}
          <div className="absolute top-4 left-6 w-28 h-28 rounded-full bg-black/25 blur-sm pointer-events-none" />
          <div className="absolute -top-12 right-0 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute top-16 right-6 w-24 h-24 rounded-full bg-gradient-to-tr from-white/20 to-white/5 backdrop-blur-xs border border-white/15 shadow-md pointer-events-none" />
          <div className="absolute -bottom-10 left-12 w-48 h-48 rounded-full bg-black/20 blur-lg pointer-events-none" />

          {/* Lengkungan Sisi Kanan Khusus Desktop (Curved divider) */}
          <div 
            className="hidden md:block absolute -top-12 -bottom-12 -right-24 w-52 bg-white rounded-[100%] shadow-[-10px_0_25px_rgba(0,0,0,0.08)] pointer-events-none z-10" 
          />

          {/* Logo & Brand Header */}
          <div className="relative z-20 flex items-center">
            <span className="group font-bold text-base tracking-wide text-[#F8F3CE] drop-shadow-sm cursor-pointer relative py-1">
              Absensi PKL
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#F8F3CE] rounded-full transition-all duration-300 ease-out group-hover:w-full shadow-sm" />
            </span>
          </div>

          {/* Headline Sambutan */}
          <div className="relative z-20 my-auto py-2 md:py-0 pr-0 md:pr-6">
            <h1 className="text-xl sm:text-2xl md:text-[32px] font-black leading-tight tracking-tight text-[#F8F3CE] drop-shadow-sm">
              Selamat datang di <br />
              <span className="text-white">portal absensi</span>
            </h1>
          </div>

          {/* Footer Desktop */}
          <div className="relative z-20 text-[11px] text-[#DDDAD0]/70 font-medium hidden md:block">
            &copy; {new Date().getFullYear()} Website Absensi PKL.
          </div>
        </div>

        {/* Kolom Form: Di mobile melengkung ke atas menimpa header (rounded-t-[32px] -mt-8), di desktop rata */}
        <div className="w-full md:w-1/2 bg-white p-7 sm:p-10 md:p-12 md:pl-16 flex flex-col justify-center relative z-20 -mt-8 md:mt-0 rounded-t-[36px] md:rounded-none shadow-[-4px_-10px_25px_rgba(0,0,0,0.06)] md:shadow-none flex-1">
          
          {/* Headline Form di Mobile / Avatar di Desktop */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-xl font-bold text-[#57564F] tracking-tight">
              Get Started
            </h2>
            <p className="text-xs text-[#7A7A73] font-normal mt-1">
              Login below to get started.
            </p>
          </div>

          {/* Form Pengisian dengan Label Mengambang/Outlined Elegan */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input NIPD / Username / Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#7A7A73] pl-1">
                E-mail Address / NIPD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A7A73]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="Enter Email or NIPD"
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-[#57564F] placeholder-[#7A7A73]/60 focus:bg-white focus:outline-none focus:border-[#57564F] focus:ring-2 focus:ring-[#57564F]/15 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#7A7A73] pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7A7A73]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-2xl pl-11 pr-11 py-3.5 text-xs text-[#57564F] placeholder-[#7A7A73]/60 focus:bg-white focus:outline-none focus:border-[#57564F] focus:ring-2 focus:ring-[#57564F]/15 transition-all shadow-xs"
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
            </div>

            {/* Tombol Login Pill */}
            <div className="pt-3">
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
            </div>
          </form>

          {/* Footer Bawah Form */}
          <div className="mt-8 text-center text-xs text-[#7A7A73]">
            Butuh bantuan akun? <span className="text-[#57564F] font-bold hover:underline cursor-pointer">Hubungi Admin</span>
          </div>

          {/* Footer Hak Cipta di Mobile */}
          <div className="mt-4 text-center text-[10px] text-[#7A7A73]/70 md:hidden pb-4">
            &copy; {new Date().getFullYear()} Website Absensi PKL.
          </div>

        </div>

      </div>
    </div>
  );
}
