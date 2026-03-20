'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Artist, Song, SongType } from '@/lib/types'

const MEMBERS: Record<string, Array<{ value: string; label: string }>> = {
  kmnz:  [{ value:'unit',label:'KMNZ ALL' },{ value:'lita',label:'🐕 LITA' },{ value:'tina',label:'🐾 TINA' },{ value:'nero',label:'🌙 NERO' },{ value:'collab',label:'🎵 コラボ' }],
  vesp:  [{ value:'unit',label:'VESP ALL' },{ value:'yomi',label:'💙 ヨミ' },{ value:'kasuka',label:'🧡 カスカ' },{ value:'collab',label:'🎵 コラボ' }],
  xiden: [{ value:'xiden',label:'XIDEN ALL' },{ value:'collab',label:'🎵 コラボ' }],
  honk:  [{ value:'unit',label:'HTH ALL' },{ value:'moco',label:'🐑 MOCO' },{ value:'bambi',label:'🦌 BAMBI' }],
}

const ART_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  kmnz:  { text:'#ff6b35', border:'rgba(255,107,53,.5)', bg:'rgba(255,107,53,.1)' },
  vesp:  { text:'#00d4ff', border:'rgba(0,212,255,.5)',  bg:'rgba(0,212,255,.1)'  },
  xiden: { text:'#00e5b0', border:'rgba(0,229,176,.5)',  bg:'rgba(0,229,176,.1)'  },
  honk:  { text:'#ffcc00', border:'rgba(255,204,0,.5)',  bg:'rgba(255,204,0,.1)'  },
}

const s = {
  // layout
  page: { minHeight:'100vh', background:'#050508', color:'#e8e8f0', fontFamily:"'Noto Sans JP',sans-serif" } as React.CSSProperties,
  header: { background:'rgba(5,5,8,.96)', borderBottom:'1px solid #1a1a2e', padding:'0 24px', height:52, display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:20 } as React.CSSProperties,
  body: { maxWidth:1000, margin:'0 auto', padding:'28px 20px 80px' } as React.CSSProperties,
  // typography
  h1: { fontFamily:'Rajdhani,sans-serif', fontSize:22, fontWeight:700, letterSpacing:'.06em', color:'#e8e8f0' },
  label: { display:'block', fontFamily:'Rajdhani,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase' as const, color:'#5a5a78', marginBottom:5 },
  // inputs
  input: { width:'100%', background:'#050508', border:'1px solid #252540', color:'#e8e8f0', borderRadius:3, padding:'8px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const },
  select: { width:'100%', background:'#050508', border:'1px solid #252540', color:'#e8e8f0', borderRadius:3, padding:'8px 10px', fontSize:12, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const },
  // buttons
  btnPrimary: { fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' as const, padding:'8px 18px', borderRadius:3, border:'1px solid rgba(0,229,176,.4)', background:'rgba(0,229,176,.12)', color:'#00e5b0', cursor:'pointer' },
  btnSecondary: { fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' as const, padding:'8px 14px', borderRadius:3, border:'1px solid #252540', background:'transparent', color:'#8888aa', cursor:'pointer' },
  btnDanger: { fontFamily:'Rajdhani,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' as const, padding:'3px 8px', borderRadius:2, border:'1px solid rgba(255,82,82,.35)', background:'transparent', color:'#ff5252', cursor:'pointer' },
  btnEdit: { fontFamily:'Rajdhani,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' as const, padding:'3px 8px', borderRadius:2, border:'1px solid #252540', background:'transparent', color:'#8888aa', cursor:'pointer' },
  // card
  card: { background:'#0d0d14', border:'1px solid #1a1a2e', borderRadius:6, padding:20, marginBottom:18 },
  // section title
  sectionTitle: { fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase' as const, color:'#5a5a78', marginBottom:12 },
}

const EMPTY_FORM = (artSlug: string) => ({
  title: '',
  year: String(new Date().getFullYear()),
  type: 'orig' as SongType,
  member: MEMBERS[artSlug]?.[0]?.value || 'unit',
  youtube_id: '',
  spotify_url: '',
  note: '',
  is_external: false,
  collab_artists: '',
})

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()

  const [artists, setArtists] = useState<Artist[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [selArt, setSelArt] = useState('kmnz')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [form, setForm] = useState(EMPTY_FORM('kmnz'))
  const [editId, setEditId] = useState<number | null>(null)
  const [ytPreview, setYtPreview] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // 認証チェック
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/admin/login')
    })
  }, [])

  const load = useCallback(async () => {
    const [{ data: arts }, { data: sgs }] = await Promise.all([
      supabase.from('artists').select('*').order('sort_order'),
      supabase.from('songs').select('*, artist:artists(slug,name_ja)').order('year', { ascending: false }).order('title'),
    ])
    if (arts) setArtists(arts)
    if (sgs) setSongs(sgs)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // YouTubeサムネイルプレビュー（500ms デバウンス）
  useEffect(() => {
    const id = form.youtube_id.trim()
    if (!id) { setYtPreview(''); return }
    const t = setTimeout(() => setYtPreview(id), 500)
    return () => clearTimeout(t)
  }, [form.youtube_id])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  const f = (key: string, val: string | boolean) => setForm(p => ({ ...p, [key]: val }))

  const switchArt = (slug: string) => {
    setSelArt(slug)
    setEditId(null)
    setYtPreview('')
    setForm(EMPTY_FORM(slug))
  }

  const currentArtist = artists.find(a => a.slug === selArt)
  const filteredSongs = songs.filter(s => (s.artist as any)?.slug === selArt)

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('タイトルを入力してください', false); return }
    const payload = {
      title: form.title.trim(),
      year: parseInt(form.year) || new Date().getFullYear(),
      type: form.type,
      members: [form.member],
      youtube_id: form.youtube_id.trim(),
      spotify_url: form.spotify_url.trim(),
      note: form.note.trim(),
      is_external: form.is_external,
      collab_artists: form.collab_artists
        ? form.collab_artists.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    }
    if (editId) {
      const { error } = await supabase.from('songs').update(payload).eq('id', editId)
      if (error) { showToast('エラー: ' + error.message, false); return }
      showToast('✅ 更新しました')
      setEditId(null)
    } else {
      const { error } = await supabase.from('songs').insert({ ...payload, artist_id: currentArtist?.id })
      if (error) { showToast('エラー: ' + error.message, false); return }
      showToast('✅ 追加しました')
    }
    setForm(EMPTY_FORM(selArt))
    setYtPreview('')
    load()
  }

  const handleEdit = (s: Song) => {
    setEditId(s.id)
    setForm({
      title: s.title, year: String(s.year), type: s.type,
      member: s.members[0] || 'unit',
      youtube_id: s.youtube_id || '',
      spotify_url: s.spotify_url || '',
      note: s.note || '',
      is_external: s.is_external || false,
      collab_artists: (s.collab_artists || []).join(', '),
    })
    setYtPreview(s.youtube_id || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('songs').delete().eq('id', id)
    if (error) { showToast('エラー: ' + error.message, false); return }
    showToast('🗑 削除しました')
    setDeleteConfirm(null)
    load()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (loading) return (
    <div style={{ ...s.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontFamily:'Rajdhani,sans-serif', letterSpacing:'.3em', color:'#5a5a78', fontSize:13 }}>LOADING...</span>
    </div>
  )

  const ac = ART_COLORS[selArt] || ART_COLORS.kmnz

  return (
    <div style={s.page}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <span style={{ ...s.h1, fontSize:18 }}>Admin Panel</span>
        <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:9, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', background:'rgba(255,200,50,.1)', border:'1px solid rgba(255,200,50,.3)', color:'#ffc832', padding:'2px 8px', borderRadius:2 }}>ADMIN</span>
        <div style={{ flex:1 }} />
        <a href="/" style={{ ...s.btnSecondary, textDecoration:'none', padding:'5px 12px', fontSize:10 }}>← サイトを見る</a>
        <button onClick={handleLogout} style={s.btnDanger}>ログアウト</button>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:100, background: toast.ok ? 'rgba(0,229,176,.15)' : 'rgba(255,82,82,.15)', border:`1px solid ${toast.ok ? 'rgba(0,229,176,.4)' : 'rgba(255,82,82,.4)'}`, color: toast.ok ? '#00e5b0' : '#ff5252', padding:'10px 18px', borderRadius:4, fontFamily:'Rajdhani,sans-serif', fontSize:13, fontWeight:600, letterSpacing:'.05em', animation:'slideIn .2s ease' }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={s.body}>

        {/* ── アーティストタブ ── */}
        <div style={{ marginBottom:24 }}>
          <div style={s.sectionTitle}>アーティスト選択</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {artists.map(a => {
              const c = ART_COLORS[a.slug] || ART_COLORS.kmnz
              const on = selArt === a.slug
              const cnt = songs.filter(s => (s.artist as any)?.slug === a.slug).length
              return (
                <button key={a.slug} onClick={() => switchArt(a.slug)}
                  style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', padding:'7px 16px', borderRadius:3, border:`1px solid ${on ? c.border : '#252540'}`, background: on ? c.bg : 'transparent', color: on ? c.text : '#8888aa', cursor:'pointer' }}>
                  {a.name_ja} <span style={{ opacity:.6, fontWeight:400 }}>({cnt})</span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18, alignItems:'start' }}>

          {/* ── 左カラム: フォーム + 一覧 ── */}
          <div>

            {/* ADD / EDIT FORM */}
            <div style={{ ...s.card, borderColor: editId ? ac.border : '#1a1a2e' }}>
              <div style={{ ...s.sectionTitle, color: editId ? ac.text : '#5a5a78' }}>
                {editId ? `✏️ 編集中 — ID: ${editId}` : '＋ 新しい曲を追加'}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {/* タイトル */}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={s.label}>曲タイトル *</label>
                  <input style={s.input} value={form.title} onChange={e => f('title', e.target.value)}
                    placeholder="例: NO LEASH" onKeyDown={e => e.key === 'Enter' && handleSave()} />
                </div>

                {/* 年 */}
                <div>
                  <label style={s.label}>リリース年 *</label>
                  <input style={s.input} type="number" value={form.year} onChange={e => f('year', e.target.value)} />
                </div>

                {/* タイプ */}
                <div>
                  <label style={s.label}>タイプ *</label>
                  <select style={s.select} value={form.type} onChange={e => f('type', e.target.value)}>
                    <option value="orig">ORIGINAL（オリジナル）</option>
                    <option value="cover">COVER（カバー）</option>
                    <option value="collab">COLLAB（コラボ）</option>
                  </select>
                </div>

                {/* メンバー */}
                <div>
                  <label style={s.label}>メンバー *</label>
                  <select style={s.select} value={form.member} onChange={e => f('member', e.target.value)}>
                    {(MEMBERS[selArt] || []).map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* YouTube ID */}
                <div>
                  <label style={s.label}>YouTube ID</label>
                  <input style={s.input} value={form.youtube_id} onChange={e => f('youtube_id', e.target.value)}
                    placeholder="例: 7kTUgS414QE" />
                  <div style={{ fontSize:10, color:'#5a5a78', marginTop:4 }}>
                    YouTube URLの <code style={{ background:'#111120', padding:'0 3px', borderRadius:2 }}>?v=</code> 以降の文字列
                  </div>
                </div>

                {/* Spotify URL */}
                <div>
                  <label style={s.label}>Spotify URL</label>
                  <input style={s.input} value={form.spotify_url} onChange={e => f('spotify_url', e.target.value)}
                    placeholder="https://open.spotify.com/track/..." />
                </div>

                {/* コラボアーティスト */}
                {form.type === 'collab' && (
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={s.label}>コラボアーティスト（カンマ区切り）</label>
                    <input style={s.input} value={form.collab_artists} onChange={e => f('collab_artists', e.target.value)}
                      placeholder="例: kmnz, vesp" />
                  </div>
                )}

                {/* メモ */}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={s.label}>メモ（任意）</label>
                  <input style={s.input} value={form.note} onChange={e => f('note', e.target.value)}
                    placeholder="例: 外部コラボ、HARMONICS EP など" />
                </div>

                {/* 外部チェック */}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:12, color:'#8888aa' }}>
                    <input type="checkbox" checked={form.is_external} onChange={e => f('is_external', e.target.checked)}
                      style={{ width:14, height:14, accentColor:'#c878ff' }} />
                    外部/チャンネル外のコラボ（「外部」バッジを表示）
                  </label>
                </div>

                {/* ボタン */}
                <div style={{ gridColumn:'1/-1', display:'flex', gap:8, alignItems:'center', paddingTop:4 }}>
                  <button onClick={handleSave} style={s.btnPrimary}>
                    {editId ? '✅ 更新する' : '✚ 追加する'}
                  </button>
                  {editId && (
                    <button onClick={() => { setEditId(null); setForm(EMPTY_FORM(selArt)); setYtPreview('') }} style={s.btnSecondary}>
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SONG LIST */}
            <div style={s.card}>
              <div style={s.sectionTitle}>
                {currentArtist?.name_ja} の曲一覧
                <span style={{ fontWeight:400, letterSpacing:0, textTransform:'none', marginLeft:6 }}>({filteredSongs.length}曲)</span>
              </div>

              {filteredSongs.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 0', color:'#5a5a78', fontSize:12 }}>
                  まだ曲が登録されていません
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {filteredSongs.map(song => (
                    <div key={song.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#050508', borderRadius:3, border:'1px solid #1a1a2e' }}>

                      {/* サムネイル */}
                      <div style={{ width:56, height:32, borderRadius:2, overflow:'hidden', background:'#111120', flexShrink:0 }}>
                        {song.youtube_id ? (
                          <img src={`https://i.ytimg.com/vi/${song.youtube_id}/default.jpg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎵</div>
                        )}
                      </div>

                      {/* 情報 */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#e8e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize:10, color:'#5a5a78', fontFamily:'Rajdhani,sans-serif', marginTop:2 }}>
                          {song.year} · {song.type.toUpperCase()} · {(song.members || []).join(', ')}
                          {song.youtube_id && <span style={{ marginLeft:6, color:'#ff5252', opacity:.7 }}>YT</span>}
                          {song.spotify_url && <span style={{ marginLeft:4, color:'#1db954', opacity:.7 }}>SP</span>}
                          {song.is_external && <span style={{ marginLeft:4, color:'#c878ff', opacity:.7 }}>外部</span>}
                        </div>
                      </div>

                      {/* 操作 */}
                      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                        <button onClick={() => handleEdit(song)} style={s.btnEdit}>編集</button>
                        {deleteConfirm === song.id ? (
                          <>
                            <button onClick={() => handleDelete(song.id)} style={{ ...s.btnDanger, background:'rgba(255,82,82,.2)' }}>確認</button>
                            <button onClick={() => setDeleteConfirm(null)} style={s.btnEdit}>✕</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(song.id)} style={s.btnDanger}>削除</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 右カラム: プレビュー ── */}
          <div style={{ position:'sticky', top:68 }}>
            <div style={s.card}>
              <div style={s.sectionTitle}>YouTubeプレビュー</div>
              {ytPreview ? (
                <>
                  <div style={{ borderRadius:3, overflow:'hidden', marginBottom:10 }}>
                    <img src={`https://i.ytimg.com/vi/${ytPreview}/mqdefault.jpg`} alt="thumbnail"
                      style={{ width:'100%', display:'block', borderRadius:3 }}
                      onError={e => { (e.target as HTMLImageElement).src = '' }} />
                  </div>
                  <a href={`https://www.youtube.com/watch?v=${ytPreview}`} target="_blank" rel="noreferrer"
                    style={{ display:'block', textAlign:'center', fontFamily:'Rajdhani,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#ff5252', border:'1px solid rgba(255,82,82,.3)', background:'rgba(255,82,82,.06)', padding:'6px', borderRadius:3, textDecoration:'none' }}>
                    ▶ YouTubeで確認
                  </a>
                </>
              ) : (
                <div style={{ aspectRatio:'16/9', background:'#111120', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6, color:'#5a5a78' }}>
                  <div style={{ fontSize:24 }}>🎬</div>
                  <div style={{ fontSize:11 }}>YouTube IDを入力すると<br />ここにサムネイルが表示されます</div>
                </div>
              )}
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>使い方ヒント</div>
              <div style={{ fontSize:11, color:'#5a5a78', lineHeight:1.7 }}>
                <div style={{ marginBottom:6 }}>
                  <span style={{ color:'#ffc832' }}>YouTube ID</span> の確認方法：<br />
                  <code style={{ background:'#111120', padding:'1px 4px', borderRadius:2, fontSize:10 }}>youtube.com/watch?v=<strong>XXXX</strong></code><br />
                  太字部分をコピーして入力
                </div>
                <div>
                  <span style={{ color:'#ffc832' }}>タイプ</span> の選び方：
                  <div style={{ paddingLeft:8, marginTop:3 }}>
                    ORIGINAL = 自分たちの曲<br />
                    COVER = 他アーティストのカバー<br />
                    COLLAB = 他VTuberとのコラボ
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
