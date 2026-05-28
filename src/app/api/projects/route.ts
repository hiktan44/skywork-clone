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
    const projectsResult = await rawQuery(`
      SELECT id, title, type, "outputUrl", "thumbnailUrl", "isPublic", prompt, "createdAt"
      FROM "Project"
      WHERE "isPublic" = true
      ORDER BY "createdAt" DESC
      LIMIT 50
    `)

    return NextResponse.json({
      projects: projectsResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        outputUrl: row.outputUrl,
        thumbnailUrl: row.thumbnailUrl,
        isPublic: row.isPublic,
        prompt: row.prompt,
        createdAt: row.createdAt,
      }))
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}