import { NextResponse } from 'next/server';
import { getAuthUser, comparePassword } from '@/lib/auth';
import { updateUserPassword, findUserById } from '@/lib/data-service';

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password baru minimal 4 karakter' },
        { status: 400 }
      );
    }

    const currentUser = await findUserById(authUser.id);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    if (currentPassword) {
      const isMatch = await comparePassword(currentPassword, currentUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Password saat ini salah' },
          { status: 400 }
        );
      }
    }

    await updateUserPassword(authUser.id, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diperbarui!'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui password: ' + error.message },
      { status: 500 }
    );
  }
}
