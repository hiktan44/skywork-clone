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
    const skillsResult = await rawQuery(`
      SELECT id, name, description, module, "systemPrompt", "defaultParams", tags, "isActive", "sortOrder"
      FROM "Skill"
      WHERE "isActive" = true
      ORDER BY "sortOrder", "name"
    `)

    return NextResponse.json({
      skills: skillsResult.rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        module: row.module,
        systemPrompt: row.systemPrompt,
        defaultParams: row.defaultParams,
        tags: row.tags,
        isActive: row.isActive,
        sortOrder: row.sortOrder,
      }))
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}