import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RK Music Hub | KMNZ × VESPERBELL × XIDEN × HONK THE HORN',
  description: 'RK Music 所属アーティストの楽曲まとめサイト',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
