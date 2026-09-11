import { NextResponse } from 'next/server';
import { deleteTodayAttendance } from '@/lib/data-service';

export async function GET() {
  try {
    await deleteTodayAttendance(null);
    return NextResponse.json({
      success: true,
      message: 'Semua data absensi hari ini berhasil dihapus/direset!'
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await deleteTodayAttendance(null);
    return NextResponse.json({
      success: true,
      message: 'Semua data absensi hari ini berhasil dihapus/direset!'
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
