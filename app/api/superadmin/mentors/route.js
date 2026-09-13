import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import {
  getAllMentorsDetailed,
  createMentorBySuperAdmin,
  updateMentorBySuperAdmin,
  deleteMentorBySuperAdmin
} from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const mentors = await getAllMentorsDetailed({ search });

    return NextResponse.json({
      success: true,
      mentors
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const body = await request.json();
    const { name, username, email, password, instansi, jabatan, bio } = body;

    if (!name || !username || !email) {
      return NextResponse.json({ success: false, message: 'Nama, Username, dan Email wajib diisi!' }, { status: 400 });
    }

    const newMentor = await createMentorBySuperAdmin({
      name,
      username,
      email,
      password: password || 'password123',
      instansi: instansi || 'Sekolah / Mitra PKL',
      jabatan: jabatan || 'Pembimbing PKL',
      bio: bio || ''
    });

    return NextResponse.json({
      success: true,
      message: 'Pembimbing berhasil ditambahkan!',
      mentor: newMentor
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const body = await request.json();
    const { mentorId, name, username, email, password, instansi, jabatan, bio } = body;

    if (!mentorId) {
      return NextResponse.json({ success: false, message: 'ID Pembimbing diperlukan' }, { status: 400 });
    }

    await updateMentorBySuperAdmin(mentorId, {
      name,
      username,
      email,
      password,
      instansi,
      jabatan,
      bio
    });

    return NextResponse.json({
      success: true,
      message: 'Profil pembimbing berhasil diperbarui!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');

    if (!mentorId) {
      return NextResponse.json({ success: false, message: 'ID Pembimbing diperlukan' }, { status: 400 });
    }

    await deleteMentorBySuperAdmin(mentorId);

    return NextResponse.json({
      success: true,
      message: 'Akun pembimbing berhasil dihapus!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
