import { NextResponse } from 'next/server';
import type { QueryResultRow } from 'pg';
import { auth } from '@/auth';
import { currentTaskOwner, taskQuery } from '@/lib/task-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' };
interface TaskRow extends QueryResultRow {
  id: string; name: string; cron: string; module: string; prompt: string;
  active: boolean; lastRun: Date | null; nextRun: Date | null;
}

export async function GET() {
  try {
    const identity = (await auth())?.user;
    if (!identity?.id || !identity.email) {
      return NextResponse.json({ error: 'Görevlerinizi görmek için giriş yapın.' }, { status: 401, headers });
    }
    const owner = await currentTaskOwner(identity.id, identity.email);
    if (!owner) return NextResponse.json({ error: 'Oturumunuz geçersiz; tekrar giriş yapın.' }, { status: 401, headers });
    const tasks = await taskQuery<TaskRow>(`
      SELECT id, name, cron, module, prompt, active, "lastRun", "nextRun"
      FROM "ScheduledTask" WHERE "userId"=$1 ORDER BY "createdAt" DESC
    `, [owner.id]);
    return NextResponse.json({ tasks: tasks.rows }, { headers });
  } catch {
    return NextResponse.json({ error: 'Görevler şu anda yüklenemiyor. Lütfen yeniden deneyin.' }, { status: 503, headers });
  }
}
