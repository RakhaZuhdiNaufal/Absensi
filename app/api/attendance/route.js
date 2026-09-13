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

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return NextResponse.json(
        { success: false, message: 'Lokasi GPS valid diperlukan untuk melakukan absensi.' },
        { status: 400 }
      );
    }

    const userLat = Number(latitude);
    const userLng = Number(longitude);

    // Alamat 1 (Lokasi PKL)
    const targetLat = student.target_lat !== null && student.target_lat !== undefined ? Number(student.target_lat) : -6.384288;
    const targetLng = student.target_lng !== null && student.target_lng !== undefined ? Number(student.target_lng) : 106.869938;
    const radius1 = student.radius_meters ? Number(student.radius_meters) : 50;
    const distance1 = calculateDistance(userLat, userLng, targetLat, targetLng);
    const isInside1 = distance1 !== null && distance1 <= radius1;

    // Alamat 2 (Lokasi Alternatif / Rumah)
    const homeLat = student.home_lat !== null && student.home_lat !== undefined ? Number(student.home_lat) : -6.396742;
    const homeLng = student.home_lng !== null && student.home_lng !== undefined ? Number(student.home_lng) : 106.839228;
    const radius2 = student.home_radius_meters ? Number(student.home_radius_meters) : (student.radius_meters ? Number(student.radius_meters) : 50);
    const distance2 = calculateDistance(userLat, userLng, homeLat, homeLng);
    const isInside2 = distance2 !== null && distance2 <= radius2;

    const isWfhMode = work_mode === 'wfh';
    const isValidLocation = isWfhMode ? (isInside1 || isInside2) : isInside1;

    // Jika posisi siswa berada di luar radius alamat yang ditentukan
    if (!isValidLocation) {
      const dist1Str = distance1 !== null ? `${distance1}m (Radius: ${radius1}m)` : 'tidak valid';
      const dist2Str = distance2 !== null ? `${distance2}m (Radius: ${radius2}m)` : 'tidak valid';
      const detailMsg = isWfhMode
        ? `Lokasi Anda berada di luar area absensi. Silakan berada di lokasi WFH atau PKL yang terdaftar pada profil.`
        : `Lokasi Anda berada di luar area absensi. Silakan berada di lokasi PKL yang terdaftar pada profil.`;

      return NextResponse.json(
        {
          success: false,
          outsideRadius: true,
          message: detailMsg
        },
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
