'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Artist, Song } from '@/lib/types'
import styles from './page.module.css'

type SortMode = 'new' | 'old' | 'title'
type SingerKey = 'lita'|'tina'|'nero'|'yomi'|'kasuka'|'xiden'|'moco'|'bambi'

// ── 歌い手メタ情報 ────────────────────────────────────────
const SINGER_META: Record<SingerKey, { label: string; art: string; chipCls: string; pipBg: string; pipColor: string }> = {
  lita:   { label:'LITA',   art:'kmnz',  chipCls:'chipLita',   pipBg:'#ffc832', pipColor:'#000' },
  tina:   { label:'TINA',   art:'kmnz',  chipCls:'chipTina',   pipBg:'#ff78c8', pipColor:'#000' },
  nero:   { label:'NERO',   art:'kmnz',  chipCls:'chipNero',   pipBg:'#64a0ff', pipColor:'#000' },
  yomi:   { label:'ヨミ',   art:'vesp',  chipCls:'chipYomi',   pipBg:'#32b4ff', pipColor:'#000' },
  kasuka: { label:'カスカ', art:'vesp',  chipCls:'chipKasuka', pipBg:'#ff8c50', pipColor:'#000' },
  xiden:  { label:'XIDEN',  art:'xiden', chipCls:'chipXiden',  pipBg:'#00e5b0', pipColor:'#000' },
  moco:   { label:'MOCO',   art:'honk',  chipCls:'chipMoco',   pipBg:'#ffcc00', pipColor:'#000' },
  bambi:  { label:'BAMBI',  art:'honk',  chipCls:'chipBambi',  pipBg:'#ff9966', pipColor:'#000' },
}

// 各アーティストの歌い手リスト
const ART_SINGERS: Record<string, SingerKey[]> = {
  kmnz:  ['lita','tina','nero'],
  vesp:  ['yomi','kasuka'],
  xiden: ['xiden'],
  honk:  ['moco','bambi'],
}

// ── ヘルパー ──────────────────────────────────────────────
const artCssClass: Record<string, string> = { kmnz:'sk', vesp:'sv', xiden:'sx', honk:'sh', collab:'sco' }

function sortSongs(songs: Song[], mode: SortMode): Song[] {
  return [...songs].sort((a, b) => {
    if (mode==='new') return b.year-a.year || a.title.localeCompare(b.title,'ja')
    if (mode==='old') return a.year-b.year || a.title.localeCompare(b.title,'ja')
    return a.title.localeCompare(b.title,'ja')
  })
}

// ── サムネイル取得フック ──────────────────────────────────
function useThumbnails(songs: Song[]) {
  const [thumbs, setThumbs] = useState<Record<string,string>>({})
  const fetched = useRef<Set<string>>(new Set())
  useEffect(() => {
    const newIds = songs.map(s=>s.youtube_id).filter((id): id is string => !!id && !fetched.current.has(id))
    if (!newIds.length) return
    setThumbs(prev => {
      const next = {...prev}
      newIds.forEach(id => { if(!next[id]) next[id]=`https://i.ytimg.com/vi/${id}/mqdefault.jpg` })
      return next
    })
    for (let i=0; i<newIds.length; i+=50) {
      const chunk = newIds.slice(i,i+50)
      chunk.forEach(id => fetched.current.add(id))
      fetch(`/api/youtube-thumbnail?ids=${chunk.join(',')}`)
        .then(r=>r.json()).then((d:Record<string,string>)=>setThumbs(p=>({...p,...d}))).catch(()=>{})
    }
  }, [songs])
  return thumbs
}

// ── SongCard ─────────────────────────────────────────────
interface SongCardProps {
  song: Song; artSlug: string; thumbUrl?: string; onInfoClick: (s:Song)=>void
}
function SongCard({ song, artSlug, thumbUrl, onInfoClick }: SongCardProps) {
  const cls = artCssClass[artSlug]||'sk'
  const ytUrl = song.youtube_id ? `https://www.youtube.com/watch?v=${song.youtube_id}` : null
  const singerPips = (song.members||[]).filter(m=>!['unit','collab'].includes(m)&&SINGER_META[m as SingerKey])
    .map(m => SINGER_META[m as SingerKey])

  return (
    <div className={`${styles.sc} ${styles[cls]}`}>
      {ytUrl ? (
        <a href={ytUrl} target="_blank" rel="noreferrer" className={styles.sthLink}>
          <div className={styles.sth}>
            {thumbUrl && <img src={thumbUrl} alt={song.title} loading="lazy"
              onError={e=>{const img=e.target as HTMLImageElement;if(!img.dataset.fb){img.dataset.fb='1';img.src=`https://i.ytimg.com/vi/${song.youtube_id}/hqdefault.jpg`}else{img.style.display='none';(img.parentElement?.querySelector('[data-ph]') as HTMLElement|null)?.style.setProperty('display','flex')}}} />}
            <div data-ph className={styles.snoth} style={{display:thumbUrl?'none':'flex'}}>🎵</div>
            <div className={styles.ytOverlay}><div className={styles.ytBtn}><span>▶</span><span className={styles.ytLabel}>YouTubeで見る</span></div></div>
          </div>
        </a>
      ) : (
        <div className={styles.sthNoLink} onClick={()=>onInfoClick(song)} style={{cursor:'pointer'}}>
          <div className={styles.sth}><div className={styles.snoth}>🎵</div></div>
        </div>
      )}
      <div className={styles.si} onClick={()=>onInfoClick(song)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&onInfoClick(song)}>
        <div className={styles.sttl}>{song.title}</div>
        <div className={styles.smeta}>
          <span className={`${styles.stp} ${song.type==='orig'?styles.to:song.type==='cover'?styles.tc:styles.tco}`}>
            {song.type==='orig'?'ORIGINAL':song.type==='cover'?'COVER':'COLLAB'}
          </span>
          <span className={styles.syr}>{song.year}</span>
          {singerPips.map((p,i)=>(
            <span key={i} className={styles.mpip} style={{background:p.pipBg,color:p.pipColor}} title={p.label}>{p.label[0]}</span>
          ))}
          {song.is_external && <span className={styles.extBadge}>外部</span>}
          {song.spotify_url && (
            <a href={song.spotify_url} target="_blank" rel="noreferrer"
              onClick={e=>e.stopPropagation()} className={styles.spBadge} title="Spotifyで聴く">♪</a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 詳細モーダル ──────────────────────────────────────────
function DetailModal({ song, onClose }: { song:Song|null; onClose:()=>void }) {
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()}
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h)
  },[onClose])
  if (!song) return null
  const ytUrl = song.youtube_id ? `https://www.youtube.com/watch?v=${song.youtube_id}` : null
  return (
    <div className={styles.mbg} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className={styles.modal}>
        {ytUrl ? (
          <a href={ytUrl} target="_blank" rel="noreferrer" className={styles.modalThumb}>
            <img src={`https://i.ytimg.com/vi/${song.youtube_id}/hqdefault.jpg`} alt={song.title} style={{width:'100%',display:'block'}}/>
            <div className={styles.modalThumbOverlay}><div className={styles.modalPlayBtn}>▶ YouTubeで見る</div></div>
          </a>
        ) : (
          <div className={styles.mnovid}>
            <div style={{fontSize:28,marginBottom:10}}>🎵</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:14,fontWeight:700,color:'#8888aa'}}>YouTube動画ID未登録</div>
            <div style={{fontSize:10,color:'#5a5a78',marginTop:6}}>管理画面からYouTube IDを追加できます</div>
          </div>
        )}
        <div className={styles.mbdy}>
          <button className={styles.mcls} onClick={onClose}>✕ 閉じる</button>
          <div className={styles.mtitl}>{song.title}</div>
          <div className={styles.mtags}>
            <span className={styles.syr} style={{fontSize:12}}>{song.year}</span>
            <span className={`${styles.stp} ${song.type==='orig'?styles.to:song.type==='cover'?styles.tc:styles.tco}`}>
              {song.type==='orig'?'ORIGINAL':song.type==='cover'?'COVER':'COLLAB'}
            </span>
            {song.note && <span className={styles.noteTag}>{song.note}</span>}
          </div>
          <div className={styles.mlnks}>
            {ytUrl
              ? <a className={`${styles.ml} ${styles.mlyt}`} href={ytUrl} target="_blank" rel="noreferrer">▶ YouTubeで見る</a>
              : <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:10,color:'#5a5a78',letterSpacing:'.05em'}}>YouTube IDが未登録です</span>
            }
            {song.spotify_url && (
              <a className={`${styles.ml} ${styles.mlsp}`} href={song.spotify_url} target="_blank" rel="noreferrer">♪ Spotifyで聴く</a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────
export default function HomePage() {
  const supabase = createClient()
  const [artists, setArtists]     = useState<Artist[]>([])
  const [songs, setSongs]         = useState<Record<string,Song[]>>({})
  const [selGroups, setSelGroups] = useState<Set<string>>(new Set(['kmnz']))
  const [selSingers, setSelSingers] = useState<Set<SingerKey>>(new Set())
  const [sortMode, setSortMode]   = useState<SortMode>('new')
  const [filters, setFilters]     = useState<Record<string,{m:string;tp:string}>>({
    kmnz:{m:'all',tp:''}, vesp:{m:'all',tp:''}, xiden:{m:'all',tp:''}, honk:{m:'all',tp:''},
  })
  const [modal, setModal]   = useState<Song|null>(null)
  const [loading, setLoading] = useState(true)

  const allSongs = Object.values(songs).flat()
  const thumbs   = useThumbnails(allSongs)

  useEffect(()=>{
    async function load(){
      const [{ data:arts },{ data:sgs }] = await Promise.all([
        supabase.from('artists').select('*').order('sort_order'),
        supabase.from('songs').select('*, artist:artists(slug,name_ja,color1,color2)').order('year',{ascending:false}),
      ])
      if(arts) setArtists(arts)
      if(sgs){
        const grouped:Record<string,Song[]>={}
        sgs.forEach((s:Song)=>{
          const slug=(s.artist as any)?.slug??'unknown'
          if(!grouped[slug]) grouped[slug]=[]
          grouped[slug].push(s)
        })
        setSongs(grouped)
      }
      setLoading(false)
    }
    load()
  },[])

  // ── グループ選択トグル ──
  const toggleGroup = useCallback((slug:string)=>{
    setSelGroups(prev=>{
      const next=new Set(prev)
      if(next.has(slug)){
        if(next.size===1) return prev
        next.delete(slug)
        // このアーティストの歌い手選択も解除
        setSelSingers(ps=>{
          const ns=new Set(ps)
          ;(ART_SINGERS[slug]||[]).forEach(s=>ns.delete(s))
          return ns
        })
      } else {
        next.add(slug)
      }
      return next
    })
  },[])

  // ── 歌い手トグル ──
  const toggleSinger = useCallback((singer:SingerKey, art:string)=>{
    setSelSingers(prev=>{
      const next=new Set(prev)
      if(next.has(singer)) { next.delete(singer) }
      else {
        next.add(singer)
        // アーティストグループが未選択なら選択
        setSelGroups(pg=>{ if(!pg.has(art)){const ng=new Set(pg);ng.add(art);return ng} return pg })
      }
      return next
    })
  },[])

  const setFilter = useCallback((art:string,key:'m'|'tp',val:string)=>{
    setFilters(prev=>({...prev,[art]:{...prev[art],[key]:val}}))
  },[])

  // ── 絞り込み ──
  const filteredSongs = useCallback((slug:string):Song[]=>{
    const all=songs[slug]||[]
    const f=filters[slug]||{m:'all',tp:''}
    return sortSongs(all,sortMode).filter(s=>{
      const mok=f.m==='all'||s.members.includes(f.m)||(f.m!=='collab'&&s.members.includes('unit'))
      const tok=!f.tp||s.type===f.tp
      return mok&&tok
    })
  },[songs,filters,sortMode])

  // ── 歌い手コラボ曲 ──
  const singerCollabSongs = useCallback(():Song[]=>{
    const singers=[...selSingers]
    if(!singers.length) return []
    const all=Object.values(songs).flat()
    const deduped=[...new Map(all.map(s=>[s.id,s])).values()]
    const collab=deduped.filter(s=>{
      if(s.type!=='collab') return false
      const m=s.members||[]
      if(singers.length===1) return m.includes(singers[0])
      return singers.every(sg=>m.includes(sg)) || singers.some(sg=>m.includes(sg))
    })
    return sortSongs(collab,sortMode)
  },[songs,selSingers,sortMode])

  // ── アーティストコラボ曲 ──
  const artCollabSongs = useCallback(():Song[]=>{
    const arts=[...selGroups]
    const all=Object.values(songs).flat().filter(s=>s.type==='collab')
    const deduped=[...new Map(all.map(s=>[s.id,s])).values()]
    return sortSongs(deduped,sortMode).filter(s=>
      arts.some(a=>(s.collab_artists||[]).includes(a)||(s.artist as any)?.slug===a)
    )
  },[songs,selGroups,sortMode])

  const artsSel   = [...selGroups]
  const singersSel = [...selSingers]
  const showSingerCollab = singersSel.length>0
  const showArtCollab    = !showSingerCollab && artsSel.length>1

  // どのパネルを表示するか
  const activePanel = showSingerCollab ? 'singer-collab' : showArtCollab ? 'art-collab' : 'artist'

  const memberOpts:Record<string,Array<{val:string;label:string}>> = {
    kmnz: [{val:'all',label:'ALL'},{val:'lita',label:'🐕 LITA'},{val:'tina',label:'🐾 TINA'},{val:'nero',label:'🌙 NERO'},{val:'collab',label:'🎵 コラボ'}],
    vesp: [{val:'all',label:'ALL'},{val:'yomi',label:'💙 ヨミ'},{val:'kasuka',label:'🧡 カスカ'},{val:'collab',label:'🎵 コラボ'}],
    xiden:[{val:'all',label:'ALL'},{val:'collab',label:'🎵 コラボ'}],
    honk: [{val:'all',label:'ALL'},{val:'moco',label:'🐑 MOCO'},{val:'bambi',label:'🦌 BAMBI'}],
  }

  if(loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--mu)',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.2em'}}>LOADING...</div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>

      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.logo}>
          <span className={styles.kc}>KMNZ</span><span className={styles.dc}>×</span>
          <span className={styles.vc}>VESPERBELL</span><span className={styles.dc}>×</span>
          <span className={styles.xc}>XIDEN</span><span className={styles.dc}>×</span>
          <span className={styles.hc}>HONK THE HORN</span>
        </div>
        <span className={styles.logoSub}>RK Music Hub</span>
        <div style={{flex:1}}/>
        <a href="/admin" className={styles.adminLink}>⚙ 管理</a>
      </div>

      <div className={styles.layout}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sbsHead}><div className={styles.sbh}>アーティスト</div></div>

          {artists.map(art=>(
            <div key={art.slug}>
              {/* アーティストグループボタン */}
              <button
                className={`${styles.sbGroup} ${selGroups.has(art.slug)?styles.sbGroupOn:''}`}
                onClick={()=>toggleGroup(art.slug)}
                style={selGroups.has(art.slug)?{borderLeftColor:art.color1,background:`${art.color1}12`}:{}}
              >
                <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,background:`linear-gradient(135deg,${art.color1},${art.color2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  {art.name_ja}
                </span>
                <span className={styles.sbGcnt}>{(songs[art.slug]||[]).length}曲</span>
              </button>

              {/* 歌い手個別ボタン（アーティスト選択時に展開） */}
              {selGroups.has(art.slug) && (
                <div className={styles.sbMembers}>
                  {(ART_SINGERS[art.slug]||[]).map(singerKey=>{
                    const meta = SINGER_META[singerKey]
                    const isOn = selSingers.has(singerKey)
                    return (
                      <button key={singerKey}
                        className={`${styles.sbMem} ${styles.sbSinger} ${isOn?styles.singerOn:''}`}
                        onClick={()=>toggleSinger(singerKey,art.slug)}
                        title={`${meta.label} のコラボ曲を絞り込む`}
                      >
                        <span className={styles.mpip} style={{background:meta.pipBg,color:meta.pipColor,width:15,height:15,flexShrink:0}}>
                          {meta.label[0]}
                        </span>
                        <span className={styles.memLabel}>{meta.label}</span>
                        {isOn && <span className={styles.singerOnMark}>✓</span>}
                      </button>
                    )
                  })}
                  {/* タイプフィルター */}
                  <div className={styles.typeRow}>
                    {(['orig','cover','collab'] as const).map(tp=>(
                      <button key={tp}
                        className={`${styles.tchip} ${filters[art.slug]?.tp===tp?styles.tchipOn:''}`}
                        onClick={()=>setFilter(art.slug,'tp',filters[art.slug]?.tp===tp?'':tp)}>
                        {tp.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 歌い手コラボ検出インジケーター */}
          {showSingerCollab && (
            <div className={styles.singerCollabDetect}>
              <div className={styles.cdetBadge}>🎤 SINGER SELECT</div>
              <div style={{fontSize:10,color:'var(--mu)',marginTop:4,lineHeight:1.5}}>
                {singersSel.map(s=>SINGER_META[s]?.label||s).join(' × ')} のコラボを表示中
              </div>
            </div>
          )}

          {/* アーティストコラボ検出インジケーター */}
          {showArtCollab && (
            <div className={styles.singerCollabDetect}>
              <div className={styles.cdetBadge}>🎵 COLLAB</div>
              <div style={{fontSize:10,color:'var(--mu)',marginTop:4,lineHeight:1.5}}>
                {artsSel.map(a=>artists.find(ar=>ar.slug===a)?.name_ja).join(' × ')} のコラボを表示中
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{marginTop:'auto',padding:'10px 10px 14px',display:'flex',flexDirection:'column',gap:4,borderTop:'1px solid var(--bd)'}}>
            {artists.map(a=>a.youtube_handle&&(
              <a key={a.slug} className={`${styles.eb} ${styles.eyt}`}
                href={`https://www.youtube.com/${a.youtube_handle}`} target="_blank" rel="noreferrer">
                ▶ {a.name_ja}
              </a>
            ))}
            <a className={`${styles.eb} ${styles.esp}`} href="https://rkmusic.jp" target="_blank" rel="noreferrer">🎵 RK Music</a>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
          <div className={styles.toolbar}>
            <span className={styles.toolbarLabel}>並び順</span>
            <div className={styles.sortBtns}>
              {(['new','old','title'] as const).map(m=>(
                <button key={m} className={`${styles.sortBtn} ${sortMode===m?styles.sortBtnOn:''}`} onClick={()=>setSortMode(m)}>
                  {m==='new'?'新しい順':m==='old'?'古い順':'タイトル順'}
                </button>
              ))}
            </div>
            <div style={{flex:1}}/>
            <span style={{fontSize:9,color:'var(--mu)',fontFamily:'Rajdhani,sans-serif',letterSpacing:'.05em',whiteSpace:'nowrap'}}>
              🖼 サムネイル→YouTube　📝 曲名→詳細
            </span>
          </div>

          <div style={{padding:'18px 20px 60px',flex:1}}>

            {/* 歌い手コラボパネル */}
            {activePanel==='singer-collab' && (
              <div>
                <div className={styles.ph}>
                  <div className={styles.phTitle} style={{color:'var(--co)'}}>🎤 歌い手コラボ</div>
                  <span className={`${styles.ptag} ${styles.tagco}`}>Singer Select</span>
                </div>
                {/* 選択歌い手チップ */}
                <div className={styles.singerPartners}>
                  {singersSel.map((s,i)=>{
                    const meta=SINGER_META[s]
                    return (
                      <span key={s}>
                        {i>0 && <span className={styles.cpPlus}>×</span>}
                        <span className={`${styles.spChip} ${styles[meta.chipCls]}`}>
                          <span className={styles.mpip} style={{background:meta.pipBg,color:meta.pipColor,width:13,height:13,fontSize:6}}>{meta.label[0]}</span>
                          {meta.label}
                        </span>
                      </span>
                    )
                  })}
                </div>
                <div className={styles.sgrid}>
                  {singerCollabSongs().map(s=>(
                    <SongCard key={s.id} song={s}
                      artSlug={(s.artist as any)?.slug||'collab'}
                      thumbUrl={s.youtube_id?thumbs[s.youtube_id]:undefined}
                      onInfoClick={setModal}/>
                  ))}
                </div>
                {singerCollabSongs().length===0 && <div className={styles.empty}>選択した歌い手のコラボ曲が見つかりません</div>}
              </div>
            )}

            {/* アーティストコラボパネル */}
            {activePanel==='art-collab' && (
              <div>
                <div className={styles.ph}>
                  <div className={styles.phTitle} style={{color:'var(--co)'}}>🎵 コラボ</div>
                  <span className={`${styles.ptag} ${styles.tagco}`}>Cross-Artist</span>
                </div>
                <div className={styles.singerPartners}>
                  {artsSel.map((a,i)=>{
                    const art=artists.find(ar=>ar.slug===a)
                    return art ? (
                      <span key={a}>
                        {i>0&&<span className={styles.cpPlus}>×</span>}
                        <span className={styles.spChip} style={{background:`${art.color1}18`,color:art.color1,border:`1px solid ${art.color1}44`}}>
                          {art.name_ja}
                        </span>
                      </span>
                    ) : null
                  })}
                </div>
                <div className={styles.sgrid}>
                  {artCollabSongs().map(s=>(
                    <SongCard key={s.id} song={s} artSlug={(s.artist as any)?.slug||'collab'}
                      thumbUrl={s.youtube_id?thumbs[s.youtube_id]:undefined} onInfoClick={setModal}/>
                  ))}
                </div>
                {artCollabSongs().length===0 && <div className={styles.empty}>このアーティスト間のコラボ曲は未登録です</div>}
              </div>
            )}

            {/* 通常アーティストパネル */}
            {activePanel==='artist' && artists.filter(a=>selGroups.has(a.slug)).map(art=>{
              const list=filteredSongs(art.slug)
              return (
                <div key={art.slug}>
                  <div className={styles.ph}>
                    <div className={styles.phTitle} style={{background:`linear-gradient(135deg,${art.color1},${art.color2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                      {art.name_ja}
                    </div>
                    <span className={styles.ptag} style={{background:`${art.color1}18`,color:art.color1,border:`1px solid ${art.color1}44`}}>
                      {art.description}
                    </span>
                  </div>
                  <div className={styles.sgrid}>
                    {list.map(s=>(
                      <SongCard key={s.id} song={s} artSlug={art.slug}
                        thumbUrl={s.youtube_id?thumbs[s.youtube_id]:undefined} onInfoClick={setModal}/>
                    ))}
                  </div>
                  {list.length===0 && <div className={styles.empty}>該当する曲が見つかりません</div>}
                  <div style={{height:32}}/>
                </div>
              )
            })}

          </div>
        </main>
      </div>

      <footer style={{borderTop:'1px solid var(--bd)',padding:'10px 20px',textAlign:'center'}}>
        <p style={{fontSize:10,color:'var(--mu)',letterSpacing:'.06em'}}>
          Fan site — All content belongs to respective artists &amp; <a href="https://rkmusic.jp" target="_blank" rel="noreferrer" style={{color:'var(--mu)'}}>RK Music</a>
        </p>
      </footer>

      <DetailModal song={modal} onClose={()=>setModal(null)}/>
    </div>
  )
}
