import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSuperAdminDashboard } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Super Admin' }, { status: 403 });
    }

    const data = await getSuperAdminDashboard();

    return NextResponse.json({
      success: true,
      ...data
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
