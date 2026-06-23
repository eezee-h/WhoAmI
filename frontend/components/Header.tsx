'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useEditor } from '@/context/EditorContext'
import { loadContent, saveContent } from '@/lib/content'
import { getCardSectionPath } from '@/lib/sections'
import LoginModal from './LoginModal'
import ConfirmModal from './ConfirmModal'

interface Props {
  siteName: string
  username: string
}

export default function Header({ siteName, username }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, isAuthenticated, isDirty, startEditing, stopEditing, logout } = useEditor()
  const [modalOpen, setModalOpen] = useState(false)
  const [navConfirm, setNavConfirm] = useState<{ open: boolean; href: string }>({ open: false, href: '' })
  const [editConfirmOpen, setEditConfirmOpen] = useState(false)

  function handleNavClick(e: React.MouseEvent, href: string) {
    if (!isDirty) return
    e.preventDefault()
    setNavConfirm({ open: true, href })
  }
  const [navLinks, setNavLinks] = useState<{ href: string; label: string }[]>([])
  const [displayName, setDisplayName] = useState(siteName)

  useEffect(() => {
    loadContent(username).then(content => {
      setDisplayName(content.home.name || siteName)
      const sectionLinks = content.homeSections
        .filter(s => s.type !== 'archive')
        .map(s => {
          if (s.type === 'activity') return { href: `/${username}/activities`, label: s.name }
          if (s.type === 'project') return { href: `/${username}/projects`, label: s.name }
          return { href: getCardSectionPath(username, s), label: s.name }
        })
      setNavLinks([
        { href: `/${username}`, label: '홈' },
        ...sectionLinks,
        { href: `/${username}/contact`, label: '연락' },
      ])
    })
  }, [pathname, username, siteName])

  async function handleNameBlur(e: React.FocusEvent<HTMLSpanElement>) {
    const newName = e.currentTarget.textContent?.trim() || ''
    if (!newName) { e.currentTarget.textContent = displayName; return }
    setDisplayName(newName)
    const content = await loadContent(username)
    content.home.name = newName
    await saveContent(content, username)
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          {isAdmin ? (
            <span
              className="site-logo"
              contentEditable
              suppressContentEditableWarning
              onBlur={handleNameBlur}
              style={{ minWidth: '2rem', outline: '2px dashed rgba(245,158,11,0.6)', borderRadius: '4px', padding: '2px 6px', cursor: 'text' }}
            >
              {displayName}
            </span>
          ) : (
            <Link href={`/${username}`} className="site-logo">{displayName}</Link>
          )}
          <nav className="site-nav">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${pathname === href ? ' active' : ''}`}
                onClick={e => handleNavClick(e, href)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {isAdmin && <span className="admin-badge">편집 중</span>}
            {isAuthenticated && (
              <Link href={`/${username}/settings`} className="btn-login" style={{ textDecoration: 'none' }}>
                설정
              </Link>
            )}
            <button
              className="btn-login"
              onClick={() => {
                if (!isAuthenticated) {
                  setModalOpen(true)
                  return
                }
                if (!isAdmin) {
                  startEditing()
                  return
                }
                if (isDirty) {
                  setEditConfirmOpen(true)
                  return
                }
                stopEditing()
              }}
            >
              {!isAuthenticated ? '로그인' : isAdmin ? '편집 종료' : '편집 시작'}
            </button>
            {isAuthenticated && (
              <button className="btn-login" onClick={logout}>
                로그아웃
              </button>
            )}
          </div>
        </div>
      </header>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} username={username} />
      <ConfirmModal
        open={navConfirm.open}
        message={'저장하지 않은 변경사항이 있습니다.\n페이지를 떠나시겠습니까?'}
        confirmLabel="페이지 이동"
        onConfirm={() => { const href = navConfirm.href; setNavConfirm({ open: false, href: '' }); router.push(href) }}
        onCancel={() => setNavConfirm({ open: false, href: '' })}
      />
      <ConfirmModal
        open={editConfirmOpen}
        message={'저장하지 않은 변경사항이 있습니다.\n편집 모드를 종료하시겠습니까?'}
        confirmLabel="편집 종료"
        onConfirm={() => { setEditConfirmOpen(false); stopEditing() }}
        onCancel={() => setEditConfirmOpen(false)}
      />
    </>
  )
}
