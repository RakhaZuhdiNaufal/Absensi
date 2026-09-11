'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Camera, History, User, BarChart3, ClipboardList, Users, UserCog, BookOpen } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const isSuperAdmin = pathname.startsWith('/superadmin');
  const isAdmin = !isSuperAdmin && pathname.startsWith('/admin');

  const siswaNavItems = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
    { label: 'Aktivitas', href: '/aktivitas', icon: Calendar },
    { label: 'Absensi', href: '/absensi', icon: Camera, isCenter: true },
    { label: 'Riwayat', href: '/riwayat', icon: History },
    { label: 'Profil', href: '/profil', icon: User },
  ];

  const adminNavItems = [
    { label: 'Beranda', href: '/admin', icon: Home },
    { label: 'Analyst', href: '/admin/analyst', icon: BarChart3 },
    { label: 'Riwayat', href: '/admin/riwayat', icon: ClipboardList },
    { label: 'Profil', href: '/admin/profil', icon: User },
  ];

  const superadminNavItems = [
    { label: 'Beranda', href: '/superadmin', icon: Home },
    { label: 'Siswa', href: '/superadmin/siswa', icon: Users },
    { label: 'Pembimbing', href: '/superadmin/pembimbing', icon: UserCog },
    { label: 'Jurnal', href: '/superadmin/jurnal', icon: BookOpen },
    { label: 'Riwayat', href: '/superadmin/riwayat', icon: History },
    { label: 'Profil', href: '/superadmin/profil', icon: User },
  ];

  const navItems = isSuperAdmin ? superadminNavItems : (isAdmin ? adminNavItems : siswaNavItems);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center md:hidden">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-t border-[#DDDAD0] px-3 py-2 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-5 flex flex-col items-center group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? 'bg-[#57564F] text-[#F8F3CE] ring-4 ring-[#F8F3CE]'
                    : 'bg-[#57564F] text-white hover:bg-[#474640]'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className={`text-[11px] font-bold mt-1 transition-colors ${isActive ? 'text-[#57564F]' : 'text-[#7A7A73]'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-[#57564F] font-bold scale-105' : 'text-[#7A7A73] hover:text-[#57564F] font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
