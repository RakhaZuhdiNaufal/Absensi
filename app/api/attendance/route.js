import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getStudentByUserId, getTodayAttendance, createAttendance, deleteTodayAttendance, bindStudentDevice, calculateDistance, getJakartaDateStr, getJakartaTimeStr } from '@/lib/data-service';

export async function DELETE(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const student = await getStudentByUserId(user.id);
    await deleteTodayAttendance(student ? student.id : null);

    return NextResponse.json({
      success: true,
      message: 'Absensi hari ini telah berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete Attendance Error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus absensi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false, message: 'Akses khusus siswa' }, { status: 403 });
    }

    const student = await getStudentByUserId(user.id);
    if (!student) {
      return NextResponse.json({ success: false, message: 'Data profil siswa belum terdaftar' }, { status: 404 });
    }

    const existing = await getTodayAttendance(student.id);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kamu sudah melakukan absensi hari ini.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { photo, latitude, longitude, location, reason, note, status, work_mode, device_id, device_name, device_type } = body;

    const normalizedType = device_type === 'mobile' ? 'mobile' : 'web';
    if (device_id) {
      if (normalizedType === 'mobile') {
        if (student.device_mobile_id && student.device_mobile_id.trim() !== '') {
          if (student.device_mobile_id.trim() !== device_id.trim()) {
            return NextResponse.json(
              {
                success: false,
                deviceMismatch: true,
                message: `Validasi Device Gagal: Akun ini sudah terdaftar pada perangkat Mobile/HP lain ("${student.device_mobile_name || 'HP Terdaftar'}"). Sistem hanya mengizinkan 1 Web & 1 Mobile per akun.`
              },
              { status: 403 }
            );
          }
        } else {

          await bindStudentDevice(student.id, device_id.trim(), device_name || 'Mobile Device', 'mobile');
        }
      } else {

        if (student.device_web_id && student.device_web_id.trim() !== '') {
          if (student.device_web_id.trim() !== device_id.trim()) {
            return NextResponse.json(
              {
                success: false,
                deviceMismatch: true,
                message: `Validasi Device Gagal: Akun ini sudah terdaftar pada perangkat Web/PC lain ("${student.device_web_name || 'Web/PC Terdaftar'}"). Sistem hanya mengizinkan 1 Web & 1 Mobile per akun.`
              },
              { status: 403 }
            );
          }
        } else {

          await bindStudentDevice(student.id, device_id.trim(), device_name || 'Web Device', 'web');
        }
      }
    }

    if (!photo) {
      return NextResponse.json(
        { success: false, message: 'Foto bukti kehadiran wajib diambil!' },
        { status: 400 }
      );
    }

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return NextResponse.json(
        { success: false, message: 'Lokasi diperlukan untuk melakukan absensi.' },
        { status: 400 }
      );
    }

    const attendance_date = getJakartaDateStr();
    const attendance_time = getJakartaTimeStr();

    const result = await createAttendance({
      student_id: student.id,
      attendance_date,
      attendance_time,
      photo,
      latitude,
      longitude,
      location: location || `Koordinat: ${latitude}, ${longitude}`,
      reason: reason || '',
      note: note || '',
      status: status || 'hadir',
      work_mode: work_mode || 'wfo',
      device_id: device_id || null
    });

    return NextResponse.json({
      success: true,
      message: 'Absensi berhasil disimpan!',
      attendance: result
    });
  } catch (error) {
    console.error('Submit Attendance Error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan absensi: ' + error.message }, { status: 500 });
  }
}
