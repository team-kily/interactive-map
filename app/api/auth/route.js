import { clearAdminCookie, isAdmin, setAdminCookie } from '@/lib/auth';
export async function GET() { return Response.json({ authenticated: await isAdmin() }); }
export async function POST(request) { const { password } = await request.json().catch(() => ({ password: '' })); const configured = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'development' ? 'bitte-aendern' : ''); if (!configured || password !== configured) return Response.json({ error: 'Das Passwort ist nicht korrekt.' }, { status: 401 }); await setAdminCookie(); return Response.json({ ok: true }); }
export async function DELETE() { await clearAdminCookie(); return Response.json({ ok: true }); }
