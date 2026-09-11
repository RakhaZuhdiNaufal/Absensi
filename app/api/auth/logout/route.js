import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil'
  });

  response.headers.set('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  return response;
}
