import { NextResponse } from 'next/server'

const DATABASE_URL = process.env.DATABASE_URL

async function rawQuery(sql: string, params?: unknown[]) {
  const { Client } = await import('pg')
  const client = new Client(DATABASE_URL)
  await client.connect()
  try {
    const result = await client.query(sql, params)
    return result
  } finally {
    await client.end()
  }
}

export async function GET() {
  try {
    const tasksResult = await rawQuery(`
      SELECT id, name, cron, module, prompt, active, "lastRun", "nextRun"
      FROM "ScheduledTask"
      ORDER BY "createdAt" DESC
    `)

    return NextResponse.json({
      tasks: tasksResult.rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        name: row.name,
        cron: row.cron,
        module: row.module,
        prompt: row.prompt,
        active: row.active,
        lastRun: row.lastRun,
        nextRun: row.nextRun,
      }))
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}