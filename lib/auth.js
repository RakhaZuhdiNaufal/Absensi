import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_pkl_absensi_2026_xyz';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function getAuthUser(req) {
  try {
    let token = req?.cookies?.get?.('token')?.value;
    if (!token) {
      const cookieHeader = req?.headers?.get?.('cookie') || req?.headers?.cookie || '';
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|; )token=([^;]*)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }
    }
    if (!token) return null;
    return verifyToken(token);
  } catch (e) {
    return null;
  }
}
