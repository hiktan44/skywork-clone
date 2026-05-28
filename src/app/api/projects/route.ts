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
      SELECT id, title, type, outputurl, thumbnailurl, ispublic, prompt, createdat
      FROM "Project"
      WHERE ispublic = true
      ORDER BY createdat DESC
      LIMIT 50
    `)

    return NextResponse.json({
      projects: projectsResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        outputUrl: row.outputurl,
        thumbnailUrl: row.thumbnailurl,
        isPublic: row.ispublic,
        prompt: row.prompt,
        createdAt: row.createdat,
      }))
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}