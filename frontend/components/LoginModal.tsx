'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditor } from '@/context/EditorContext'

interface Props {
  open: boolean
  onClose: () => void
  username: string
}

export default function LoginModal({ open, onClose, username }: Props) {
  const { login } = useEditor()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const idRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setId('')
      setPassword('')
      setError(false)
      setTimeout(() => idRef.current?.focus(), 50)
    }
  }, [open])

  async function handleLogin() {
    const ok = await login(username, id, password)
    if (ok) {
      onClose()
    } else {
      setError(true)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>로그인</h2>
        <p>아이디와 비밀번호를 입력하면 페이지를 직접 수정할 수 있어요.</p>
        <input
          ref={idRef}
          type="text"
          className="modal-input"
          placeholder="아이디"
          value={id}
          onChange={(e) => { setId(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <input
          type="password"
          className="modal-input"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className="modal-error">아이디 또는 비밀번호가 올바르지 않습니다.</p>}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-primary" onClick={handleLogin}>로그인</button>
        </div>
      </div>
    </div>
  )
}
