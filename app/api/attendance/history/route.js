import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getStudentByUserId, getStudentAttendanceHistory } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let studentId = null;
    if (user.role === 'siswa') {
      const student = await getStudentByUserId(user.id);
      if (!student) {
        return NextResponse.json({ success: false, message: 'Student profile not found' }, { status: 404 });
      }
      studentId = student.id;
    } else {
      studentId = searchParams.get('student_id');
    }

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'Student ID required' }, { status: 400 });
    }

    const history = await getStudentAttendanceHistory(studentId, filter);

    return NextResponse.json({
      success: true,
      filter,
      history
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
