import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateStudentProfile, getStudentByUserId } from '@/lib/data-service';

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Cek pembatasan edit profil khusus siswa: hanya bisa 1 kali
    if (user.role === 'siswa') {
      const currentStudent = await getStudentByUserId(user.id);
      if (currentStudent && Number(currentStudent.profile_updated) === 1) {
        return NextResponse.json(
          {
            success: false,
            message: 'Profil hanya bisa diubah 1 kali.'
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { name, username, email, status, tempat_pkl, pembimbing_name, bio, jabatan, instansi, siswa_bimbingan, alamat_rumah, alamat_pkl, class: studentClass, nis, major } = body;

    await updateStudentProfile(user.id, {
      name,
      username,
      email,
      status,
      tempat_pkl,
      pembimbing_name,
      bio,
      jabatan,
      instansi,
      siswa_bimbingan,
      alamat_rumah,
      alamat_pkl,
      class: studentClass,
      nis,
      major
    });

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
