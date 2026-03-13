'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor } from '@/context/EditorContext'
import { deleteUser } from '@/lib/users'
import { THEMES, ThemeKey, loadTheme, applyTheme } from '@/lib/theme'
import { apiSetTheme } from '@/lib/api'

export default function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const username = decodeURIComponent(params.username as string)
  const { isAdmin, logout } = useEditor()

  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(() => loadTheme(username))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  function handleThemeSelect(key: ThemeKey) {
    setCurrentTheme(key)
    applyTheme(key)
    const password = sessionStorage.getItem('site-admin-password') ?? ''
    apiSetTheme(username, password, key)
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>관리자 로그인 후 접근할 수 있습니다.</p>
      </div>
    )
  }

  async function handleDelete() {
    if (!password) { setError('비밀번호를 입력해주세요.'); return }
    const ok = await deleteUser(username, password)
    if (!ok) {
      setError('비밀번호가 올바르지 않습니다.')
      return
    }
    logout()
    router.replace('/')
  }

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 32 }}>계정 설정</h2>

      {/* 테마 */}
      <section style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>색상 테마</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-sub)', marginBottom: 20, lineHeight: 1.6 }}>
          사이트 전체 색상을 변경합니다.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeSelect(key)}
              title={theme.label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                width: 64, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                border: currentTheme === key ? `2px solid ${theme.swatch}` : '2px solid transparent',
                background: currentTheme === key ? `${theme.swatch}18` : 'var(--color-primary-soft)',
                transition: 'all 0.16s',
              }}
            >
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: theme.swatch, display: 'block', boxShadow: `0 2px 8px ${theme.swatch}55` }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{theme.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={{
        border: '1px solid #f87171',
        borderRadius: 12,
        padding: 24,
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>계정 삭제</h3>
        <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: 20, lineHeight: 1.6 }}>
          계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>

        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{
              padding: '8px 18px',
              background: 'transparent',
              border: '1px solid #f87171',
              color: '#ef4444',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            계정 삭제
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              style={{
                padding: '10px 14px',
                border: error ? '1px solid #ef4444' : '1px solid #333',
                borderRadius: 8,
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            {error && <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                삭제 확인
              </button>
              <button
                onClick={() => { setConfirm(false); setPassword(''); setError('') }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#aaa',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
