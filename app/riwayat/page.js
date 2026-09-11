'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import TopNavbar from '@/components/TopNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink
} from 'lucide-react';

export default function RiwayatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchHistory(filter);
  }, [filter]);

  const fetchHistory = async (selectedFilter) => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success) {
        router.push('/login');
        return;
      }
      if (meData.user.role === 'admin') {
        router.push('/admin/riwayat');
        return;
      }
      setUser(meData.user);

      const res = await fetch(`/api/attendance/history?filter=${selectedFilter}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'Semua' },
    { id: 'day', label: 'Hari Ini' },
    { id: 'week', label: 'Minggu Ini' },
    { id: 'month', label: 'Bulan Ini' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#57564F] pb-24 md:pb-8">
      <TopNavbar />
      <div className="max-w-xl mx-auto md:ml-64 md:max-w-none p-4 md:p-6 md:pr-8 space-y-4">

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#DDDAD0] space-y-4">
          <div className="pb-3 border-b border-[#DDDAD0] text-center">
            <h1 className="text-sm font-normal uppercase tracking-wider text-[#57564F]">ABSEN PKL</h1>
          </div>

          <div className="flex items-center justify-between gap-1 text-xs relative">
            {filterTabs.map((f) => {
              const isActive = filter === f.id;
              return (
                <motion.button
                  key={f.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setFilter(f.id)}
                  className={`relative flex-1 py-2 rounded-xl font-bold text-center transition-colors duration-200 select-none cursor-pointer outline-none ${
                    isActive
                      ? 'text-[#F8F3CE]'
                      : 'text-[#7A7A73] hover:text-[#57564F]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 bg-[#57564F] rounded-xl shadow-sm"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10 block">{f.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-center py-10"
            >
              <div className="w-8 h-8 border-4 border-[#57564F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#7A7A73] font-semibold">Memuat riwayat presensi...</p>
            </motion.div>
          ) : history.length === 0 ? (
            <motion.div
              key={`empty-${filter}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-8 text-center border border-[#DDDAD0] text-[#7A7A73] text-xs"
            >
              Belum ada riwayat absensi untuk periode ini.
            </motion.div>
          ) : (
            <motion.div
              key={`list-${filter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-3"
            >
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.008, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#DDDAD0] hover:border-[#57564F] transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-[#57564F]">
                      {new Date(item.attendance_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-[#7A7A73] font-normal">
                      {item.attendance_time} WIB
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt="Foto Absen"
                        className="w-14 h-14 rounded-full object-cover border border-[#DDDAD0] shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#f9f8f3] border border-[#DDDAD0] flex items-center justify-center text-[#7A7A73] text-[10px] shrink-0">
                        No Photo
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#57564F] font-semibold truncate">
                        {item.location || 'Lokasi Terverifikasi'}
                      </p>
                      {item.reason && (
                        <p className="text-[11px] text-[#57564F] font-medium mt-1">
                          Alasan: {item.reason}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-[11px] text-[#7A7A73] truncate mt-0.5">
                          Catatan: {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DDDAD0]/60 flex items-center justify-end">
                    <span className="text-[11px] text-[#57564F] font-normal">
                      Detail
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-24 sm:pb-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0] sticky top-0 bg-white z-10">
                <h3 className="text-sm font-bold text-[#57564F]">Detail Proof Absensi</h3>
                <button onClick={() => setSelectedItem(null)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedItem.photo && (
                <div className="rounded-2xl overflow-hidden bg-black border border-[#DDDAD0]">
                  <img src={selectedItem.photo} alt="Foto Absen" className="w-full max-h-52 object-cover mx-auto" />
                </div>
              )}

              <div className="bg-[#f9f8f3] p-3.5 rounded-2xl border border-[#DDDAD0] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Tanggal:</span>
                  <span className="font-normal text-[#57564F]">
                    {new Date(selectedItem.attendance_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Jam Masuk:</span>
                  <span className="font-normal text-[#57564F]">{selectedItem.attendance_time} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Status:</span>
                  <span className="font-normal text-[#57564F] uppercase">
                    {selectedItem.work_mode ? selectedItem.work_mode.toUpperCase() : selectedItem.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7A73]">Koordinat:</span>
                  <span className="font-mono text-[11px] font-normal text-[#57564F]">{selectedItem.latitude}, {selectedItem.longitude}</span>
                </div>
                <div className="pt-2 border-t border-[#DDDAD0]">
                  <span className="text-[#7A7A73] block mb-0.5">Lokasi Lengkap:</span>
                  <span className="font-normal text-[#57564F] block leading-relaxed">{selectedItem.location}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
