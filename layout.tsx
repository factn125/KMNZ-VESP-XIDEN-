import { NextRequest, NextResponse } from 'next/server'

// YouTube Data API v3 でサムネイルURLを取得
// GET /api/youtube-thumbnail?ids=id1,id2,id3  (最大50件まとめて取得可)
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')
  if (!ids) return NextResponse.json({ error: 'ids required' }, { status: 400 })

  const idList = ids.split(',').map(id => id.trim()).filter(Boolean)

  // APIキー未設定 → i.ytimg.com の静的URLにフォールバック（APIなしでも動作）
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    const fallback: Record<string, string> = {}
    idList.forEach(id => { fallback[id] = `https://i.ytimg.com/vi/${id}/mqdefault.jpg` })
    return NextResponse.json(fallback)
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos`
    + `?part=snippet&id=${idList.join(',')}&key=${apiKey}`
    + `&fields=items(id,snippet(thumbnails))`

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 86400 } }) // 24h キャッシュ

    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)

    const data = await res.json()
    const result: Record<string, string> = {}

    for (const item of data.items || []) {
      const t = item.snippet?.thumbnails
      // 高解像度優先: maxres(1280) > standard(640) > high(480) > medium(320) > default(120)
      result[item.id] =
        t?.maxres?.url || t?.standard?.url || t?.high?.url ||
        t?.medium?.url || `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`
    }

    // APIに存在しなかったIDはフォールバック
    idList.forEach(id => {
      if (!result[id]) result[id] = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
    })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }
    })
  } catch {
    // エラー時は全IDをフォールバック
    const fallback: Record<string, string> = {}
    idList.forEach(id => { fallback[id] = `https://i.ytimg.com/vi/${id}/mqdefault.jpg` })
    return NextResponse.json(fallback)
  }
}
