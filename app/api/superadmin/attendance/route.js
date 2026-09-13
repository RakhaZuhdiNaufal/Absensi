import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAllAttendanceDetailed } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Akses khusus Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const studentId = searchParams.get('studentId') || '';
    const date = searchParams.get('date') || '';
    const status = searchParams.get('status') || '';
    const filterRange = searchParams.get('filterRange') || '';

    const attendance = await getAllAttendanceDetailed({ search, studentId, date, status, filterRange });

    return NextResponse.json({
      success: true,
      attendance
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
