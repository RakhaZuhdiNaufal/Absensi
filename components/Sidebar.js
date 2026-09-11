'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Calendar,
  Camera,
  History,
  User,
  BarChart3,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Users,
  UserCog,
  BookOpen
} from 'lucide-react';

let clientCollapsedCache = false;
let clientActiveIndexCache = -1;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(clientCollapsedCache);
  const [mounted, setMounted] = useState(false);
  const [prevIndex] = useState(clientActiveIndexCache);

  const isSuperAdmin = pathname.startsWith('/superadmin') || user?.role === 'super_admin';
  const isAdmin = !isSuperAdmin && pathname.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('sidebar_collapsed');
    const isSavedCollapsed = savedState === 'true';
    clientCollapsedCache = isSavedCollapsed;
    setIsCollapsed(isSavedCollapsed);
    if (isSavedCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    fetchUserData();
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    clientCollapsedCache = nextState;
    localStorage.setItem('sidebar_collapsed', String(nextState));
    if (nextState) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setStudent(data.student);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  const siswaNavItems = [
    { label: 'BERANDA', href: '/dashboard', icon: Home },
    { label: 'AKTIVITAS', href: '/aktivitas', icon: Calendar },
    { label: 'ABSENSI', href: '/absensi', icon: Camera },
    { label: 'RIWAYAT', href: '/riwayat', icon: History },
    { label: 'PROFIL', href: '/profil', icon: User },
  ];

  const adminNavItems = [
    { label: 'BERANDA', href: '/admin', icon: Home },
    { label: 'ANALISIS', href: '/admin/analyst', icon: BarChart3 },
    { label: 'RIWAYAT', href: '/admin/riwayat', icon: ClipboardList },
    { label: 'PROFIL', href: '/admin/profil', icon: User },
  ];

  const superadminNavItems = [
    { label: 'BERANDA', href: '/superadmin', icon: Home },
    { label: 'DATA SISWA', href: '/superadmin/siswa', icon: Users },
    { label: 'PEMBIMBING', href: '/superadmin/pembimbing', icon: UserCog },
    { label: 'JURNAL PKL', href: '/superadmin/jurnal', icon: BookOpen },
    { label: 'RIWAYAT ABSEN', href: '/superadmin/riwayat', icon: History },
    { label: 'PROFIL', href: '/superadmin/profil', icon: User },
  ];

  const navItems = isSuperAdmin ? superadminNavItems : (isAdmin ? adminNavItems : siswaNavItems);

  useEffect(() => {
    const idx = navItems.findIndex(item => {
      const isExact = item.href === '/dashboard' || item.href === '/admin' || item.href === '/superadmin';
      if (isExact) {
        return pathname === item.href;
      }
      return pathname.startsWith(item.href);
    });
    if (idx !== -1) {
      clientActiveIndexCache = idx;
    }
  }, [pathname, navItems]);

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 bottom-0 ${
        isCollapsed ? 'w-20 pl-3' : 'w-64 pl-6'
      } bg-[#57564F] text-[#F8F3CE] flex-col justify-between pt-6 pb-8 pr-0 z-40 shadow-none ${
        mounted ? 'transition-all duration-350 ease-[cubic-bezier(0.25,1,0.5,1)]' : ''
      }`}
    >

      <div className={`flex flex-col items-center text-center pt-2 pb-4 border-b border-[#DDDAD0]/20 shrink-0 ${isCollapsed ? 'mr-3' : 'mr-6'}`}>
        <div className="relative mb-3 shrink-0">
          <img
            src={user?.photo || student?.photo || '/default-avatar.png'}
            alt={user?.name || 'User'}
            className={`${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'} rounded-full object-cover shadow-md ${
              mounted ? 'transition-all duration-350 ease-[cubic-bezier(0.25,1,0.5,1)]' : ''
            }`}
          />
        </div>
        {!isCollapsed && (
          <div className="transition-opacity duration-200">
            <h2 className="text-sm font-bold text-[#F8F3CE] uppercase tracking-wider line-clamp-1">
              {user?.name || (isSuperAdmin ? 'Super Admin' : 'User Presensi')}
            </h2>
            {isSuperAdmin ? (
              <p className="text-[10px] text-[#F8F3CE] bg-white/15 px-2.5 py-0.5 rounded-full inline-block mt-1 font-semibold tracking-wide border border-white/20">
                Super Administrator
              </p>
            ) : isAdmin ? (
              <p className="text-[11px] text-[#DDDAD0] opacity-80 mt-0.5 truncate max-w-[200px]">
                Pembimbing PKL
              </p>
            ) : null}
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col justify-center my-auto relative py-6">
        <div className="relative">

          {(() => {
            const activeIndex = navItems.findIndex(item => {
              const isExact = item.href === '/dashboard' || item.href === '/admin' || item.href === '/superadmin';
              if (isExact) {
                return pathname === item.href;
              }
              return pathname.startsWith(item.href);
            });

            if (activeIndex === -1) return null;

            return (
              <motion.div
                initial={
                  prevIndex !== -1 && prevIndex !== activeIndex
                    ? { y: prevIndex * 62, opacity: 1 }
                    : false
                }
                animate={{
                  y: activeIndex * 62,
                  opacity: 1
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  mass: 0.8
                }}
                className="absolute top-0 left-0 -right-[1px] h-12 bg-[#f9f8f3] rounded-l-full z-10 pointer-events-none"
              >

                <svg
                  className="absolute -top-[19px] right-0 w-5 h-5 text-[#f9f8f3] pointer-events-none z-20"
                  viewBox="0 0 20 20"
                  fill="none"
                  shapeRendering="geometricPrecision"
                >
                  <path
                    d="M20 0 A20 20 0 0 1 0 20 L20 20 Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  className="absolute -bottom-[19px] right-0 w-5 h-5 text-[#f9f8f3] pointer-events-none z-20"
                  viewBox="0 0 20 20"
                  fill="none"
                  shapeRendering="geometricPrecision"
                >
                  <path
                    d="M0 0 A20 20 0 0 1 20 20 L20 0 Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
            );
          })()}

          <div className="space-y-3.5 relative z-20">
            {navItems.map((item) => {
              const isExact = item.href === '/dashboard' || item.href === '/admin' || item.href === '/superadmin';
              const isActive = pathname === item.href || (!isExact && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div key={item.href} className="h-12 w-full flex items-center">
                  <Link
                    href={item.href}
                    onClick={() => {
                      const curIndex = navItems.findIndex(n => n.href === item.href);
                      if (curIndex !== -1) {
                        sessionStorage.setItem('active_nav_index', String(curIndex));
                      }
                    }}
                    className={`w-full h-full flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} text-xs tracking-wider transition-colors duration-200 ${
                      isActive
                        ? 'text-[#57564F] font-bold'
                        : 'text-[#DDDAD0] font-semibold hover:text-white'
                    }`}
                  >
                    {isCollapsed ? (
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#57564F]' : 'text-[#DDDAD0]'}`} />
                    ) : (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <div className={`shrink-0 border-t border-[#DDDAD0]/30 pt-3.5 ${isCollapsed ? 'mr-3' : 'mr-6'} pb-2`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2.5">
            <button
              onClick={toggleCollapse}
              className="w-8 h-8 rounded-full bg-white text-[#57564F] border border-[#DDDAD0] hover:bg-[#F8F3CE] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Toggle Sidebar"
              title="Buka Sidebar"
            >
              <ChevronRight className="w-4 h-4 text-[#57564F]" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[10px] font-semibold tracking-wider uppercase text-[#DDDAD0] hover:text-white transition-colors cursor-pointer text-center"
              title="LOG OUT"
            >
              LOG OUT
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pl-6 pr-1">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold tracking-wider uppercase text-[#DDDAD0] hover:text-white transition-colors cursor-pointer py-1"
              title="LOG OUT"
            >
              LOG OUT
            </button>
            <button
              onClick={toggleCollapse}
              className="w-8 h-8 rounded-full bg-white text-[#57564F] border border-[#DDDAD0] hover:bg-[#F8F3CE] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Toggle Sidebar"
              title="Tutup Sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-[#57564F]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
