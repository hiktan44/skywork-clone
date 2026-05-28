import { NextResponse } from 'next/server'

const DATABASE_URL = process.env.DATABASE_URL

async function rawQuery(sql: string, params?: any[]) {
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
    const projectCols = await rawQuery(`SELECT column_name FROM information_schema.columns WHERE table_name = 'project' ORDER BY ordinal_position`)
    const skillCols = await rawQuery(`SELECT column_name FROM information_schema.columns WHERE table_name = 'skill' ORDER BY ordinal_position`)
    const taskCols = await rawQuery(`SELECT column_name FROM information_schema.columns WHERE table_name = 'scheduledtask' ORDER BY ordinal_position``)
    
    return NextResponse.json({
      project: projectCols.rows.map((r: any) => r.column_name),
      skill: skillCols.rows.map((r: any) => r.column_name),
      task: taskCols.rows.map((r: any) => r.column_name),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}