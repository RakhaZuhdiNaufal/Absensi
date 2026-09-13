import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getStudentByUserId, resetStudentDevice } from '@/lib/data-service';

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let targetStudentId = null;
    let deviceType = null;

    if (user.role === 'admin') {
      const body = await request.json().catch(() => ({}));
      targetStudentId = body.student_id;
      deviceType = body.device_type || null;
      if (!targetStudentId) {
        return NextResponse.json({ success: false, message: 'student_id diperlukan' }, { status: 400 });
      }
    } else if (user.role === 'siswa') {
      const body = await request.json().catch(() => ({}));
      deviceType = body.device_type || null;
      const student = await getStudentByUserId(user.id);
      if (!student) {
        return NextResponse.json({ success: false, message: 'Siswa tidak ditemukan' }, { status: 404 });
      }
      targetStudentId = student.id;
    } else {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
    }

    await resetStudentDevice(targetStudentId, deviceType);

    return NextResponse.json({
      success: true,
      message: 'Perangkat terdaftar berhasil di-reset.'
    });
  } catch (error) {
    console.error('Reset Device Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
