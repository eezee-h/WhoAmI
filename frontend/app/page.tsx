'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, findPageByCredentials } from '@/lib/users'

type Tab = 'signup' | 'login'

const inputStyle = { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const }
const hintStyle = { fontSize: '0.78rem', color: '#aaa', marginTop: '-0.25rem' }

export default function LandingPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [pageName, setPageName] = useState('')
  const [signupId, setSignupId] = useState('')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setPageName(''); setSignupId(''); setLoginId(''); setPassword(''); setConfirm(''); setError('')
  }

  async function handleSignup() {
    const u = pageName.trim()
    const sid = signupId.trim()
    if (!u) return setError('페이지 이름을 입력하세요.')
    if (!sid) return setError('아이디를 입력하세요.')
    if (!password) return setError('비밀번호를 입력하세요.')
    if (password !== confirm) return setError('비밀번호가 일치하지 않습니다.')
    setLoading(true)
    const result = await registerUser(u, sid, password)
    setLoading(false)
    if (!result.ok) return setError(result.error ?? '오류가 발생했습니다.')
    router.push(`/${u}`)
  }

  async function handleLogin() {
    const inputId = loginId.trim()
    if (!inputId) return setError('아이디를 입력하세요.')
    if (!password) return setError('비밀번호를 입력하세요.')
    setLoading(true)
    const page = await findPageByCredentials(inputId, password)
    setLoading(false)
    if (!page) return setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    router.push(`/${page}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') tab === 'signup' ? handleSignup() : handleLogin()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(circle at top left,rgba(203,213,225,0.3),transparent 28%),radial-gradient(circle at bottom right,rgba(71,85,105,0.1),transparent 26%),linear-gradient(180deg,#f9fafb 0%,#f1f5f9 52%,#e8edf4 100%)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Who am I?</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.95rem' }}>나만의 포트폴리오 사이트를 만들고 관리해보세요.</p>

      <div style={{ width: '100%', maxWidth: '380px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {(['login', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); reset() }}
              style={{ flex: 1, padding: '1rem', fontWeight: tab === t ? 700 : 400, color: tab === t ? '#111' : '#aaa', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #111' : '2px solid transparent', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '-1px' }}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tab === 'login' ? (
            <>
              <input type="text" placeholder="아이디" value={loginId} autoFocus
                onChange={e => { setLoginId(e.target.value); setError('') }} onKeyDown={handleKeyDown} style={inputStyle} />
              <input type="password" placeholder="비밀번호" value={password}
                onChange={e => { setPassword(e.target.value); setError('') }} onKeyDown={handleKeyDown} style={inputStyle} />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <input type="text" placeholder="페이지 이름" value={pageName} autoFocus
                  onChange={e => { setPageName(e.target.value); setError('') }} onKeyDown={handleKeyDown} style={inputStyle} />
                <p style={hintStyle}>URL 및 페이지 이름으로 사용됩니다. (예: 사이트주소/{pageName || '홍길동'})</p>
              </div>
              <input type="text" placeholder="아이디" value={signupId}
                onChange={e => { setSignupId(e.target.value); setError('') }} onKeyDown={handleKeyDown} style={inputStyle} />
              <input type="password" placeholder="비밀번호" value={password}
                onChange={e => { setPassword(e.target.value); setError('') }} onKeyDown={handleKeyDown} style={inputStyle} />
              <input type="password" placeholder="비밀번호 확인" value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }} onKeyDown={handleKeyDown} style={inputStyle} />
            </>
          )}
          {error && <p style={{ color: '#e53935', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <button
            onClick={tab === 'login' ? handleLogin : handleSignup}
            disabled={loading}
            style={{ padding: '0.85rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '처리 중...' : tab === 'login' ? '로그인' : '시작하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
