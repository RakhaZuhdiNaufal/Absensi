import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAdminStats } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const stats = await getSuperAdminStats();

    return NextResponse.json({
      success: true,
      ...stats
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
