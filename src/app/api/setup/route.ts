import { NextResponse } from 'next/server'

// Veritabanı kurulumu HTTP isteğinden çalıştırılmaz.
export async function GET() {
  return NextResponse.json(
    { error: 'Bu kurulum uç noktası kaldırıldı. Veritabanı kurulumu yetkili sunucu komutuyla yapılmalıdır.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
