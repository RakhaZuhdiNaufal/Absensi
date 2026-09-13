import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import {
  getAllStudentsDetailed,
  createStudentBySuperAdmin,
  updateStudentBySuperAdmin,
  deleteStudentBySuperAdmin,
  getStudentHistoryDetailed
} from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Super Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const search = searchParams.get('search') || '';
    const classFilter = searchParams.get('class') || '';

    if (studentId) {
      const history = await getStudentHistoryDetailed(studentId);
      return NextResponse.json({
        success: true,
        ...history
      });
    }

    const students = await getAllStudentsDetailed({ search, classFilter });

    return NextResponse.json({
      success: true,
      students
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Super Admin' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      username,
      email,
      password,
      class: studentClass,
      major,
      tempat_pkl,
      alamat_rumah,
      alamat_pkl,
      pembimbing_id,
      target_lat,
      target_lng,
      radius_meters,
      home_lat,
      home_lng,
      home_radius_meters
    } = body;

    if (!name || !username || !email) {
      return NextResponse.json({ success: false, message: 'Nama, NIS/Username, dan Email wajib diisi!' }, { status: 400 });
    }

    const result = await createStudentBySuperAdmin({
      name,
      username,
      email,
      password: password || '123456',
      class: studentClass || 'XII RPL 1',
      major: major || 'Rekayasa Perangkat Lunak',
      tempat_pkl: tempat_pkl || '',
      alamat_rumah: alamat_rumah || '',
      alamat_pkl: alamat_pkl || '',
      pembimbing_id: pembimbing_id || null,
      target_lat: target_lat ? Number(target_lat) : -6.384288,
      target_lng: target_lng ? Number(target_lng) : 106.869938,
      radius_meters: radius_meters ? Number(radius_meters) : 50,
      home_lat: home_lat ? Number(home_lat) : -6.396742,
      home_lng: home_lng ? Number(home_lng) : 106.839228,
      home_radius_meters: home_radius_meters ? Number(home_radius_meters) : 50
    });

    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil ditambahkan!',
      student: result
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Super Admin' }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentId,
      name,
      username,
      email,
      password,
      class: studentClass,
      major,
      tempat_pkl,
      alamat_rumah,
      alamat_pkl,
      pembimbing_id,
      target_lat,
      target_lng,
      radius_meters,
      home_lat,
      home_lng,
      home_radius_meters
    } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'ID Siswa diperlukan' }, { status: 400 });
    }

    await updateStudentBySuperAdmin(studentId, {
      name,
      username,
      email,
      password,
      class: studentClass,
      major,
      tempat_pkl,
      alamat_rumah,
      alamat_pkl,
      pembimbing_id,
      target_lat: target_lat !== undefined && target_lat !== '' ? Number(target_lat) : undefined,
      target_lng: target_lng !== undefined && target_lng !== '' ? Number(target_lng) : undefined,
      radius_meters: radius_meters !== undefined && radius_meters !== '' ? Number(radius_meters) : undefined,
      home_lat: home_lat !== undefined && home_lat !== '' ? Number(home_lat) : undefined,
      home_lng: home_lng !== undefined && home_lng !== '' ? Number(home_lng) : undefined,
      home_radius_meters: home_radius_meters !== undefined && home_radius_meters !== '' ? Number(home_radius_meters) : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Profil siswa berhasil diperbarui!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Super Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'ID Siswa diperlukan' }, { status: 400 });
    }

    await deleteStudentBySuperAdmin(studentId);

    return NextResponse.json({
      success: true,
      message: 'Akun siswa berhasil dihapus!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
