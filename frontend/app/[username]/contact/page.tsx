'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { loadContent, saveContent } from '@/lib/content'
import type { SiteContent, ContactLink, ContactType } from '@/lib/types'
import InlineEditable from '@/components/InlineEditable'
import SaveButton from '@/components/SaveButton'
import { useEditor } from '@/context/EditorContext'

const EMAIL_ICON = (
  <svg viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75L35 40h7c1.657 0 3-1.343 3-3V16.2z"/>
    <path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z"/>
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
    <path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859C9.132 8.301 8.228 8 7.298 8 4.924 8 3 9.924 3 12.298z"/>
    <path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341C38.868 8.301 39.772 8 40.702 8 43.076 8 45 9.924 45 12.298z"/>
  </svg>
)
const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)
const INSTAGRAM_ICON = (
  <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ig-bg2" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#ffdd55"/>
        <stop offset="10%" stopColor="#ffad55"/>
        <stop offset="35%" stopColor="#ff543e"/>
        <stop offset="50%" stopColor="#c837ab"/>
        <stop offset="70%" stopColor="#9b27af"/>
        <stop offset="100%" stopColor="#515bd4"/>
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-bg2)"/>
    <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
    <circle cx="12" cy="12" r="3.8" stroke="white" strokeWidth="1.8" fill="none"/>
    <circle cx="17" cy="7" r="1.2" fill="white"/>
  </svg>
)
const LINKEDIN_ICON = (
  <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#0A66C2"/>
    <path fill="white" d="M7.5 9.5H5v9h2.5v-9zM6.25 8.3a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9zM19 18.5h-2.5v-4.4c0-1.05-.02-2.4-1.46-2.4-1.46 0-1.69 1.14-1.69 2.32v4.48H10.9v-9h2.4v1.23h.03c.33-.63 1.15-1.3 2.37-1.3 2.54 0 3.3 1.67 3.3 3.84v5.23z"/>
  </svg>
)
const TWITTER_ICON = (
  <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#000"/>
    <path fill="white" d="M17.53 4h2.5l-5.47 6.25L21 20h-5.04l-3.52-4.6L7.96 20H5.46l5.85-6.68L3 4h5.17l3.18 4.21L17.53 4zm-.88 14.4h1.38L7.42 5.42H5.93l10.72 12.98z"/>
  </svg>
)
const FACEBOOK_ICON = (
  <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#1877F2"/>
    <path fill="white" d="M16 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 0 1 4-4h2v3z"/>
  </svg>
)

const CONTACT_META: Record<ContactType, { label: string; icon: React.ReactNode; placeholder: string; getUrl: (v: string) => string | null }> = {
  email:     { label: 'E-mail',    icon: EMAIL_ICON,     placeholder: 'your@email.com',        getUrl: () => null },
  github:    { label: 'GitHub',   icon: GITHUB_ICON,    placeholder: 'github.com/username',    getUrl: v => v ? `https://${v.replace(/^https?:\/\//, '')}` : null },
  instagram: { label: 'Instagram', icon: INSTAGRAM_ICON, placeholder: '@username',              getUrl: v => v ? `https://instagram.com/${v.replace(/^@/, '')}` : null },
  linkedin:  { label: 'LinkedIn', icon: LINKEDIN_ICON,  placeholder: 'linkedin.com/in/username', getUrl: v => v ? `https://${v.replace(/^https?:\/\//, '')}` : null },
  twitter:   { label: 'X (Twitter)', icon: TWITTER_ICON, placeholder: '@username',             getUrl: v => v ? `https://x.com/${v.replace(/^@/, '')}` : null },
  facebook:  { label: 'Facebook', icon: FACEBOOK_ICON,  placeholder: 'facebook.com/username',  getUrl: v => v ? `https://${v.replace(/^https?:\/\//, '')}` : null },
}

const ALL_TYPES: ContactType[] = ['email', 'facebook', 'github', 'instagram', 'linkedin', 'twitter']

export default function ContactPage() {
  const params = useParams()
  const username = decodeURIComponent(params.username as string)
  const { isAdmin } = useEditor()

  const [content, setContent] = useState<SiteContent | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => { loadContent(username).then(setContent) }, [username])

  if (!content) return null


  function updateLink(id: string, value: string) {
    setContent(prev => prev ? { ...prev, contact: prev.contact.map(c => c.id === id ? { ...c, value } : c) } : prev)
  }

  function addContact(type: ContactType) {
    const newLink: ContactLink = { id: `${type}-${Date.now()}`, type, value: '' }
    setContent(prev => prev ? { ...prev, contact: [...prev.contact, newLink] } : prev)
    setShowPicker(false)
  }

  function removeContact(id: string) {
    setContent(prev => prev ? { ...prev, contact: prev.contact.filter(c => c.id !== id) } : prev)
  }

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setDragOverIdx(null); return }
    setContent(prev => {
      if (!prev) return prev
      const next = [...prev.contact]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(toIdx, 0, moved)
      return { ...prev, contact: next }
    })
    setDragIdx(null); setDragOverIdx(null)
  }

  function handleCardClick(link: ContactLink) {
    if (isAdmin) return
    if (link.type === 'email') {
      navigator.clipboard.writeText(link.value).then(() => {
        setCopiedId(link.id); setTimeout(() => setCopiedId(null), 2000)
      })
      return
    }
    const url = CONTACT_META[link.type]?.getUrl(link.value)
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="container">
      <div className="section-card contact-title">
        <h1>연락하기</h1>
        <p>편하게 연락주세요.</p>
      </div>

      <div className="section-card">
        <div className="contact-cards">
          {content.contact.map((link, idx) => {
            const meta = CONTACT_META[link.type]
            const active = !!link.value
            const isDragging = dragIdx === idx
            const isDragOver = dragOverIdx === idx && dragIdx !== idx
            return (
              <div
                key={link.id}
                className={`contact-card${isDragOver ? ' card-drag-over' : ''}${isDragging ? ' card-dragging' : ''}`}
                style={{
                  opacity: active ? 1 : 0.5,
                  cursor: isAdmin ? 'grab' : active ? 'pointer' : 'default',
                  position: 'relative',
                }}
                draggable={isAdmin}
                onDragStart={() => setDragIdx(idx)}
                onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                onClick={() => handleCardClick(link)}
              >
                {isAdmin && (
                  <button
                    className="contact-card-remove"
                    onClick={e => { e.stopPropagation(); removeContact(link.id) }}
                    title="삭제"
                  >×</button>
                )}
                <div className="contact-icon">{meta?.icon}</div>
                <div className="contact-info">
                  <h3>{meta?.label}</h3>
                  <InlineEditable tag="p" onBlur={v => updateLink(link.id, v)}>
                    {link.value || meta?.placeholder}
                  </InlineEditable>
                </div>
                {link.type === 'email' && copiedId === link.id && <span className="copy-toast">복사됨 ✓</span>}
              </div>
            )
          })}
        </div>

        {isAdmin && (
          <div className="contact-add-wrap">
            {showPicker ? (
              <div className="contact-picker">
                {ALL_TYPES.map(type => {
                  const meta = CONTACT_META[type]
                  return (
                    <button key={type} className="contact-picker-item" onClick={() => addContact(type)}>
                      <span className="contact-picker-icon">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <button className="contact-add-btn" onClick={() => setShowPicker(true)}>
                + 연락처 추가
              </button>
            )}
          </div>
        )}
      </div>

      <SaveButton onSave={async () => saveContent(content, username)} />
    </div>
  )
}
