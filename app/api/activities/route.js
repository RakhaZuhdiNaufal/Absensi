import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getStudentByUserId, getStudentActivities, createActivity, updateActivity, deleteActivityById, clearStudentActivities, getJakartaDateStr } from '@/lib/data-service';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let targetStudentId = searchParams.get('student_id');

    if (user.role === 'siswa') {
      const student = await getStudentByUserId(user.id);
      if (!student) return NextResponse.json({ success: false, message: 'Profil siswa tidak ditemukan' }, { status: 404 });
      targetStudentId = student.id;
    }

    if (!targetStudentId) {
      return NextResponse.json({ success: false, message: 'Student ID required' }, { status: 400 });
    }

    const activities = await getStudentActivities(targetStudentId);

    return NextResponse.json({
      success: true,
      activities
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false, message: 'Akses khusus siswa' }, { status: 403 });
    }

    const student = await getStudentByUserId(user.id);
    if (!student) {
      return NextResponse.json({ success: false, message: 'Profil siswa tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, activity_date, start_time, end_time } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Judul dan deskripsi kegiatan wajib diisi!' },
        { status: 400 }
      );
    }

    const date = activity_date || getJakartaDateStr();

    const activity = await createActivity({
      student_id: student.id,
      title,
      description,
      activity_date: date,
      start_time,
      end_time
    });

    return NextResponse.json({
      success: true,
      message: 'Aktivitas PKL berhasil ditambahkan!',
      activity
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'siswa') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, activity_date, start_time, end_time } = body;

    if (!id || !title || !description) {
      return NextResponse.json(
        { success: false, message: 'ID, judul, dan deskripsi wajib diisi!' },
        { status: 400 }
      );
    }

    const updated = await updateActivity(id, {
      title,
      description,
      activity_date: activity_date || getJakartaDateStr(),
      start_time,
      end_time
    });

    return NextResponse.json({
      success: true,
      message: 'Aktivitas berhasil diperbarui!',
      activity: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('id');

    if (activityId) {
      await deleteActivityById(activityId);
      return NextResponse.json({
        success: true,
        message: 'Aktivitas berhasil dihapus'
      });
    }

    let studentId = null;
    if (user.role === 'siswa') {
      const student = await getStudentByUserId(user.id);
      if (student) studentId = student.id;
    }

    await clearStudentActivities(studentId);

    return NextResponse.json({
      success: true,
      message: 'Semua aktivitas berhasil dikosongkan'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
