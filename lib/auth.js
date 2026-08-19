import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'interactive_admin';
const secret = () => process.env.AUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'local-development-secret-change-me' : '');

function signature(value) { return createHmac('sha256', secret()).update(value).digest('hex'); }

export async function isAdmin() {
  if (!secret()) return false;
  const value = (await cookies()).get(COOKIE)?.value || '';
  const [payload, received] = value.split('.');
  if (!payload || !received || payload !== 'admin') return false;
  const expected = signature(payload);
  return received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export async function setAdminCookie() {
  const value = `admin.${signature('admin')}`;
  (await cookies()).set(COOKIE, value, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' });
}

export async function clearAdminCookie() { (await cookies()).delete(COOKIE); }
