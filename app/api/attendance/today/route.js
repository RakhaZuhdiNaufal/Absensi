import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getStudentByUserId, getTodayAttendance } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false, message: 'Akses khusus siswa' }, { status: 403 });
    }

    const student = await getStudentByUserId(user.id);
    if (!student) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    const attendanceToday = await getTodayAttendance(student.id);

    return NextResponse.json({
      success: true,
      hasAttended: !!attendanceToday,
      attendance: attendanceToday,
      student
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
