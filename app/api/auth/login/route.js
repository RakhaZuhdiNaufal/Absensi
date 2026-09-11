import { NextResponse } from 'next/server';
import { findUserByCredential, createDynamicUserForNipd } from '@/lib/data-service';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential, password } = body;

    if (!credential || !password) {
      return NextResponse.json(
        { success: false, message: 'NIPD / Username / Email dan Password wajib diisi' },
        { status: 400 }
      );
    }

    let user = await findUserByCredential(credential);
    if (!user) {

      user = await createDynamicUserForNipd(credential);
    }

    if (user.role === 'admin') {
      user.name = 'Pak Ridwan';
      user.username = 'Ridwan';
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = signToken(tokenPayload);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieHeaderValue = `token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProd ? '; Secure' : ''}`;

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: tokenPayload
    });

    response.headers.set('Set-Cookie', cookieHeaderValue);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server: ' + error.message },
      { status: 500 }
    );
  }
}
