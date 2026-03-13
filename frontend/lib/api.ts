import type { SiteContent } from './types'
import { defaultContent } from './defaultContent'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// ── Content ──────────────────────────────────────────────────────────────────

export async function apiGetContent(username: string): Promise<SiteContent> {
  try {
    const res = await fetch(`${API}/api/${username}/content`)
    if (!res.ok) return structuredClone(defaultContent)
    return res.json()
  } catch {
    return structuredClone(defaultContent)
  }
}

export async function apiSaveContent(username: string, password: string, content: SiteContent): Promise<void> {
  await fetch(`${API}/api/${username}/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, content }),
  })
}

export async function apiUserExists(username: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/${username}/exists`)
    if (!res.ok) return false
    const data = await res.json()
    return data.exists === true
  } catch {
    return false
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(loginId: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.pageUsername ?? null
  } catch {
    return null
  }
}

export async function apiRegister(
  username: string,
  loginId: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, loginId, password }),
    })
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: data.message ?? '오류가 발생했습니다.' }
  } catch {
    return { ok: false, error: '서버에 연결할 수 없습니다.' }
  }
}

export async function apiVerifyAdmin(username: string, loginId: string, password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/auth/${username}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function apiGetTheme(username: string): Promise<string> {
  try {
    const res = await fetch(`${API}/api/${username}/theme`)
    if (!res.ok) return 'black'
    const data = await res.json()
    return data.theme ?? 'black'
  } catch {
    return 'black'
  }
}

export async function apiSetTheme(username: string, password: string, theme: string): Promise<void> {
  try {
    await fetch(`${API}/api/${username}/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, theme }),
    })
  } catch { /* ignore */ }
}

export async function apiDeleteUser(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/auth/${username}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    return res.ok
  } catch {
    return false
  }
}
