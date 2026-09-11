'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function ThemedDatePicker({ value = '', onChange, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parseDate = (dStr) => {
    if (!dStr) return new Date();
    const [y, m, d] = dStr.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
    return new Date();
  };

  const selectedDate = parseDate(value);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

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

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelect = (y, m, d) => {
    const formatted = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (onChange) onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    handleSelect(y, m, d);
    setViewYear(y);
    setViewMonth(m);
  };

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  const remainingCells = 42 - calendarDays.length >= 7 ? 35 - calendarDays.length : 42 - calendarDays.length;
  const targetCells = remainingCells >= 0 ? remainingCells : (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= targetCells; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  const displayFormatted = selectedDate.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const today = new Date();

  return (
    <div className="relative w-full" ref={containerRef}>

      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#f9f8f3] hover:bg-white border border-[#DDDAD0] focus:border-[#57564F] rounded-xl px-3 py-2 text-xs text-[#57564F] flex items-center justify-between shadow-sm transition-all text-left font-medium"
      >
        <span>{value ? displayFormatted : 'Pilih Tanggal'}</span>
        <CalendarIcon className="w-3.5 h-3.5 text-[#7A7A73]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white border border-[#DDDAD0] rounded-2xl shadow-xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#57564F]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f9f8f3] text-[#57564F] transition-colors border border-[#DDDAD0]/40"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f9f8f3] text-[#57564F] transition-colors border border-[#DDDAD0]/40"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#7A7A73]">
            {DAY_NAMES.map((name) => (
              <span key={name} className="py-0.5">{name}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected =
                value &&
                cell.year === selectedDate.getFullYear() &&
                cell.month === selectedDate.getMonth() &&
                cell.day === selectedDate.getDate();

              const isToday =
                cell.year === today.getFullYear() &&
                cell.month === today.getMonth() &&
                cell.day === today.getDate();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(cell.year, cell.month, cell.day)}
                  className={`w-8 h-8 mx-auto text-xs font-semibold rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#57564F] text-[#F8F3CE] shadow-sm'
                      : isToday
                      ? 'border border-[#57564F] text-[#57564F] font-bold bg-[#f9f8f3]'
                      : cell.isCurrentMonth
                      ? 'text-[#57564F] hover:bg-[#f9f8f3]'
                      : 'text-[#DDDAD0] hover:bg-[#f9f8f3]/50'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#DDDAD0] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-semibold text-[#57564F] hover:underline"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-[#f9f8f3] hover:bg-[#DDDAD0]/40 text-[#57564F] rounded-lg text-[11px] font-semibold border border-[#DDDAD0] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
