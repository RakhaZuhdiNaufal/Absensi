'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import TopNavbar from '@/components/TopNavbar';
import ThemedTimePicker from '@/components/ThemedTimePicker';
import ThemedDatePicker from '@/components/ThemedDatePicker';
import {
  Calendar,
  Plus,
  Clock,
  X,
  Trash2
} from 'lucide-react';

export default function AktivitasPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timelineRef = useRef(null);
  const [svgPath, setSvgPath] = useState('');

  const calculateWavePath = () => {
    if (!timelineRef.current) return;
    const container = timelineRef.current;
    const containerRect = container.getBoundingClientRect();
    const badges = container.querySelectorAll('[data-timeline-badge]');
    if (!badges || badges.length === 0) return;

    const points = [];
    badges.forEach((badge) => {
      const badgeRect = badge.getBoundingClientRect();
      const x = badgeRect.left + badgeRect.width / 2 - containerRect.left;
      const y = badgeRect.top + badgeRect.height / 2 - containerRect.top;
      points.push({ x, y });
    });

    if (points.length < 2) {
      setSvgPath('');
      return;
    }

    const isMobile = window.innerWidth < 768;
    const waveAmp = isMobile ? 8 : 22;

    let d = `M ${points[0].x} ${points[0].y} `;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dy = p2.y - p1.y;
      const dir = i % 2 === 0 ? 1 : -1;

      const cp1x = p1.x + dir * waveAmp;
      const cp1y = p1.y + dy * 0.35;
      const cp2x = p2.x - dir * waveAmp;
      const cp2y = p1.y + dy * 0.65;

      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
    }

    setSvgPath(d);
  };

  useEffect(() => {
    const timer = setTimeout(calculateWavePath, 50);
    const handleResize = () => calculateWavePath();
    window.addEventListener('resize', handleResize);

    let observer;
    if (typeof ResizeObserver !== 'undefined' && timelineRef.current) {
      observer = new ResizeObserver(() => {
        calculateWavePath();
      });
      observer.observe(timelineRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [activities]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meRes.ok || !meData.success) {
        router.push('/login');
        return;
      }
      setUser(meData.user);
      setStudent(meData.student);

      const actRes = await fetch('/api/activities');
      const actData = await actRes.json();
      if (actData.success) {
        setActivities(actData.activities || []);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingActivityId(null);
    setTitle('');
    setDescription('');
    setActivityDate(new Date().toISOString().split('T')[0]);
    setStartTime('08:00');
    setEndTime('16:00');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (act) => {
    setEditingActivityId(act.id);
    setTitle(act.title || '');
    setDescription(act.description || '');
    const dateFormatted = act.activity_date ? new Date(act.activity_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setActivityDate(dateFormatted);
    setStartTime(act.start_time ? act.start_time.slice(0, 5) : '08:00');
    setEndTime(act.end_time ? act.end_time.slice(0, 5) : '16:00');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Yakin ingin menghapus catatan kegiatan ini?')) return;
    try {
      const res = await fetch(`/api/activities?id=${activityId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities(prev => prev.filter(a => a.id !== activityId));
      } else {
        alert(data.message || 'Gagal menghapus kegiatan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!title || !description) {
      setErrorMsg('Nama dan deskripsi kegiatan wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = Boolean(editingActivityId);
      const url = '/api/activities';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = {
        title,
        description,
        activity_date: activityDate,
        start_time: startTime,
        end_time: endTime,
        ...(isEditing ? { id: editingActivityId } : {})
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal menyimpan kegiatan.');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setEditingActivityId(null);
      setTitle('');
      setDescription('');
      setSubmitting(false);
      fetchData();
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi.');
      setSubmitting(false);
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

      <div className="md:ml-64">

        <div className="w-full bg-white px-4 md:px-8 py-5 border-b border-[#DDDAD0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.photo || student?.photo || '/default-avatar.png'}
              alt={user?.name}
              className="w-12 h-12 rounded-full object-cover border border-[#DDDAD0] shrink-0 shadow-sm"
            />
            <div>
              <h2 className="text-base font-normal text-[#57564F]">{user?.name}</h2>
              <div className="text-xs text-[#7A7A73] font-normal mt-0.5">
                {student?.class || 'XII RPL 1'}
              </div>
            </div>
          </div>

          <div className="flex justify-end shrink-0">
            <button
              onClick={openCreateModal}
              className="bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 text-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Catatan
            </button>
          </div>
        </div>

        <div className="max-w-xl mx-auto md:max-w-none p-4 md:p-6 md:pr-8 space-y-4">

          <div className="py-2">
            <div className="text-center mb-6">
              <h3 className="inline-block text-sm md:text-base font-bold text-[#57564F] uppercase tracking-wider pb-1.5 border-b-2 border-[#DDDAD0]">
                Timeline Kegiatan PKL
              </h3>
            </div>

            {activities.length > 0 && (
              <div ref={timelineRef} className="relative space-y-8 md:space-y-12">

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                >
                  {svgPath && (
                    <path
                      d={svgPath}
                      fill="none"
                      stroke="#DDDAD0"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {activities.map((act, index) => {
                  const isRight = index % 2 === 0;

                  return (
                    <div key={act.id || index} className="relative flex items-center">

                      <div
                        data-timeline-badge
                        className="absolute left-4 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#57564F] text-[#F8F3CE] font-bold text-xs flex items-center justify-center border-2 border-white ring-4 ring-[#f9f8f3] shadow-sm shrink-0"
                      >
                        {index + 1}
                      </div>

                      <div
                        className={`w-full md:w-[calc(50%-2rem)] pl-12 md:pl-0 ${
                          isRight ? 'md:ml-auto' : 'md:mr-auto'
                        }`}
                      >
                        <div className="bg-white p-4 rounded-2xl border border-[#DDDAD0] shadow-sm space-y-2.5 hover:shadow-md transition-shadow relative group">
                          {/* Header Baris Atas: Tanggal/Waktu dan Aksi Edit (teks tidak bold) & Hapus (icon) */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-normal text-[#57564F] bg-[#f9f8f3] px-2.5 py-0.5 rounded-full border border-[#DDDAD0] flex items-center gap-1 shrink-0 whitespace-nowrap">
                                <Calendar className="w-3 h-3 text-[#7A7A73]" />
                                {new Date(act.activity_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>

                              {(act.start_time || act.end_time) && (
                                <span className="text-[10px] font-normal text-[#57564F] bg-[#f9f8f3] px-2.5 py-0.5 rounded-full border border-[#DDDAD0] flex items-center gap-1 shrink-0 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-[#7A7A73]" />
                                  {(act.start_time || '').slice(0, 5)} - {(act.end_time || '').slice(0, 5)} WIB
                                </span>
                              )}
                            </div>

                            {/* Tombol Hapus (icon) */}
                            <div className="flex items-center shrink-0 select-none">
                              <button
                                type="button"
                                onClick={() => handleDeleteActivity(act.id)}
                                className="p-1 text-[#7A7A73] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus catatan kegiatan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-[#57564F] leading-snug">{act.title}</h4>
                          <p className="text-xs text-[#7A7A73] leading-relaxed whitespace-pre-line">{act.description}</p>

                          <div className="pt-2 border-t border-[#DDDAD0] flex flex-wrap items-center justify-between text-[11px] text-[#7A7A73]">
                            <button
                              type="button"
                              onClick={() => openEditModal(act)}
                              className="text-[11px] font-normal text-[#57564F] hover:text-black hover:underline transition-colors cursor-pointer"
                              title="Edit kegiatan"
                            >
                              Edit
                            </button>
                            {act.start_time && act.end_time && (
                              <span className="text-[11px] font-normal text-[#7A7A73]">
                                Waktu: {act.start_time} - {act.end_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pb-10 sm:pb-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDDAD0] sticky top-0 bg-white z-10">
              <h3 className="text-sm font-normal text-[#57564F]">
                {editingActivityId ? 'Edit Kegiatan PKL' : 'Catat Kegiatan PKL Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-[#f9f8f3] text-[#7A7A73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl text-[#57564F] text-xs font-normal">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveActivity} className="space-y-3 pb-4">
              <div>
                <label className="block text-xs font-normal text-[#57564F] mb-1">Tanggal Kegiatan</label>
                <ThemedDatePicker
                  value={activityDate}
                  onChange={(val) => setActivityDate(val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-normal text-[#57564F] mb-1">
                    Jam Datang
                  </label>
                  <ThemedTimePicker
                    value={startTime}
                    onChange={(val) => setStartTime(val)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#57564F] mb-1">
                    Jam Pulang
                  </label>
                  <ThemedTimePicker
                    value={endTime}
                    onChange={(val) => setEndTime(val)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#57564F] mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F] font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#57564F] mb-1">Deskripsi Detail Pekerjaan & Skill</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#f9f8f3] border border-[#DDDAD0] rounded-xl px-3 py-2 text-xs text-[#57564F] focus:outline-none focus:border-[#57564F]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-[#DDDAD0] opacity-80 hover:opacity-100 text-[#57564F] font-normal py-3 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] font-normal py-3 rounded-xl text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
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
