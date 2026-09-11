'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';

export default function ThemedTimePicker({ value = '08:00', onChange, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [hStr = '08', mStr = '00'] = (value || '08:00').split(':');
  let hNum = parseInt(hStr, 10);
  if (isNaN(hNum)) hNum = 8;
  const period = hNum >= 12 ? 'PM' : 'AM';
  const hour12 = hNum % 12 === 0 ? 12 : hNum % 12;
  const minute = mStr.slice(0, 2);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateTime = (newHour12, newMinute, newPeriod) => {
    let h24 = newHour12;
    if (newPeriod === 'PM') {
      h24 = newHour12 === 12 ? 12 : newHour12 + 12;
    } else {
      h24 = newHour12 === 12 ? 0 : newHour12;
    }
    const formatted = `${String(h24).padStart(2, '0')}:${newMinute}`;
    if (onChange) onChange(formatted);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const displayTime = `${String(hour12).padStart(2, '0')}:${minute} ${period}`;

  return (
    <div className="relative w-full" ref={containerRef}>

      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#f9f8f3] hover:bg-white border border-[#DDDAD0] focus:border-[#57564F] rounded-xl px-3 py-2 text-xs text-[#57564F] flex items-center justify-between shadow-sm transition-all text-left font-medium"
      >
        <span>{displayTime}</span>
        <Clock className="w-3.5 h-3.5 text-[#7A7A73]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-60 bg-white border border-[#DDDAD0] rounded-2xl shadow-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold text-[#7A7A73] pb-1 border-b border-[#DDDAD0]">
            <span>JAM</span>
            <span>MENIT</span>
            <span>AM/PM</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 h-44">

            <div className="overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
              {hours.map((h) => {
                const isSelected = h === hour12;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateTime(h, minute, period)}
                    className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#57564F] text-[#F8F3CE] shadow-sm'
                        : 'text-[#57564F] hover:bg-[#f9f8f3]'
                    }`}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <div className="overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
              {minutes.map((m) => {
                const isSelected = m === minute;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateTime(hour12, m, period)}
                    className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#57564F] text-[#F8F3CE] shadow-sm'
                        : 'text-[#57564F] hover:bg-[#f9f8f3]'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              {['AM', 'PM'].map((p) => {
                const isSelected = p === period;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateTime(hour12, minute, p)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#57564F] text-[#F8F3CE] shadow-sm'
                        : 'text-[#7A7A73] hover:bg-[#f9f8f3] border border-[#DDDAD0]/60'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-1 border-t border-[#DDDAD0]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 bg-[#57564F] hover:bg-[#474640] text-[#F8F3CE] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Selesai</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
