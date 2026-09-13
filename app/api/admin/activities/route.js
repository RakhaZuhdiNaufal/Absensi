import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAllActivitiesDetailed } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const studentId = searchParams.get('studentId') || '';
    const date = searchParams.get('date') || '';

    const activities = await getAllActivitiesDetailed({ search, studentId, date });

    return NextResponse.json({
      success: true,
      activities
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
