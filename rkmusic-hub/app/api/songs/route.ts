import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// GET /api/songs?artist=kmnz
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const artist = req.nextUrl.searchParams.get('artist')

  let query = supabase
    .from('songs')
    .select('*, artist:artists(slug,name_ja,color1,color2)')
    .order('year', { ascending: false })
    .order('title')

  if (artist) {
    const { data: artistRow } = await supabase
      .from('artists').select('id').eq('slug', artist).single()
    if (artistRow) query = query.eq('artist_id', artistRow.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/songs  — 管理者のみ
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('songs').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/songs  — 管理者のみ
export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...rest } = body
  const { data, error } = await supabase.from('songs').update(rest).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// DELETE /api/songs?id=123  — 管理者のみ
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
