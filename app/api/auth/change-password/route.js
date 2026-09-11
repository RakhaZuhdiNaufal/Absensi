import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateUserPassword } from '@/lib/data-service';

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password baru minimal 4 karakter' },
        { status: 400 }
      );
    }

    await updateUserPassword(user.id, newPassword);

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
