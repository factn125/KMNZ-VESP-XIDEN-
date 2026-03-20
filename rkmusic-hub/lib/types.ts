export type ArtistSlug = 'kmnz' | 'vesp' | 'xiden' | 'honk'
export type SongType = 'orig' | 'cover' | 'collab'

export interface Artist {
  id: number
  slug: ArtistSlug
  name_ja: string
  name_en: string
  description: string | null
  color1: string
  color2: string
  spotify_id: string | null
  youtube_handle: string | null
  twitter_handle: string | null
  sort_order: number
}

export interface Song {
  id: number
  artist_id: number
  title: string
  year: number
  type: SongType
  members: string[]
  youtube_id: string
  spotify_url: string
  note: string
  is_external: boolean
  collab_artists: string[]
  created_at: string
  updated_at: string
  // join
  artist?: Artist
}
