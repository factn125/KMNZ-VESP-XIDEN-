'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが違います')
    } else {
      router.push('/admin')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--sf)', border: '1px solid var(--bd2)', borderRadius: 6, padding: 32 }}>
        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--tx)' }}>
          🔐 管理者ログイン
        </h1>
        <p style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 24 }}>RK Music Hub 管理画面</p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontFamily: 'Rajdhani,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--mu)', marginBottom: 5 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="admin@example.com"
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bd2)', color: 'var(--tx)', borderRadius: 3, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: 'Rajdhani,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--mu)', marginBottom: 5 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bd2)', color: 'var(--tx)', borderRadius: 3, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>

        {error && <p style={{ fontSize: 11, color: '#ff5252', marginBottom: 14 }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '9px 0', background: 'rgba(123,97,255,.2)', border: '1px solid var(--v1)', color: 'var(--v2)', borderRadius: 3, fontFamily: 'Rajdhani,sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <a href="/" style={{ fontSize: 11, color: 'var(--mu)' }}>← サイトに戻る</a>
        </div>
      </div>
    </div>
  )
}
