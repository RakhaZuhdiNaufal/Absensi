import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateUserPhoto } from '@/lib/data-service';

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { photo } = await request.json();

    if (!photo) {
      return NextResponse.json(
        { success: false, message: 'Foto profil wajib diisi!' },
        { status: 400 }
      );
    }

    await updateUserPhoto(user.id, photo);

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil diperbarui!',
      photo
    });
  } catch (error) {
    console.error('Update Photo Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui foto profil: ' + error.message },
      { status: 500 }
    );
  }
}
