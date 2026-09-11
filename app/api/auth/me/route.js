import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getStudentByUserId, findUserById } from '@/lib/data-service';

export async function GET(request) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let user = await findUserById(authUser.id);
  if (!user) {
    user = { ...authUser };
  }

  if (user.role === 'admin') {
    if (!user.name) user.name = 'Pak Ridwan';
    if (!user.username) user.username = 'pak ridwan';
  }

  let studentDetails = null;
  if (user.role === 'siswa') {
    studentDetails = await getStudentByUserId(user.id);
  }

  return NextResponse.json({
    success: true,
    user,
    student: studentDetails
  });
}
