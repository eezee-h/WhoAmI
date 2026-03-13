'use client'

import { useEffect, useRef, useState } from 'react'
import type { CardItem, InfoCard } from '@/lib/types'
import { resizeImageToBase64 } from '@/lib/imageUtils'
import InlineEditable from './InlineEditable'
import DetailBlockEditor from './DetailBlockEditor'
import LinkPreviewCard from './LinkPreviewCard'
import { useEditor } from '@/context/EditorContext'

interface Props {
  item: CardItem
  onClose: () => void
  onUpdate: (id: string, updates: Partial<CardItem>) => void
}

const PRESET_ICONS = ['🏢', '💼', '📋', '👥', '⚙️', '📝', '🔗', '🎯', '📌', '🌟', '🖥️', '📊', '🏆', '🎓', '📅', '💡', '🚀', '👨‍💻', '🌐', '📱', '✉️', '📍', '🤝', '💰', '🔧', '📚', '🎨', '🏅']

export default function CardModal({ item, onClose, onUpdate }: Props) {
  const { isAdmin } = useEditor()
  const [newTag, setNewTag] = useState('')
  const newTagRef = useRef<HTMLInputElement>(null)
  const [iconPickerIdx, setIconPickerIdx] = useState<number | null>(null)
  const mouseDownOnOverlay = useRef(false)
  const [showLinkInput, setShowLinkInput] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [onClose])

  const headerTitle = item.type === 'activity' ? '대외활동 상세' : '프로젝트 상세'
  const tags = item.tags ?? []
  const infoCards = item.infoCards ?? []

  function updateInfoCard(idx: number, field: keyof InfoCard, value: string) {
    const next = infoCards.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    onUpdate(item.id, { infoCards: next })
  }

  function removeInfoCard(idx: number) {
    onUpdate(item.id, { infoCards: infoCards.filter((_, i) => i !== idx) })
  }

  function addInfoCard() {
    const newCard: InfoCard = {
      id: String(Date.now()),
      icon: '📝',
      label: '항목',
      value: '',
    }
    onUpdate(item.id, { infoCards: [...infoCards, newCard] })
  }

  function addTag() {
    const v = newTag.trim()
    if (!v) return
    onUpdate(item.id, { tags: [...tags, v] })
    setNewTag('')
  }

  function removeTag(i: number) {
    onUpdate(item.id, { tags: tags.filter((_, idx) => idx !== i) })
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={e => { mouseDownOnOverlay.current = e.target === e.currentTarget }}
      onMouseUp={e => { if (mouseDownOnOverlay.current && e.target === e.currentTarget) onClose() }}
    >
      <div className="proj-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="proj-modal-header">
          <span className="proj-modal-header-title">{headerTitle}</span>
          <button className="proj-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="proj-modal-scroll">
          {/* Cover Image */}
          {item.image && (
            <div className="proj-modal-cover">
              <img src={item.image} alt={item.title} />
              {isAdmin && (
                <div className="proj-modal-image-input-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    id={`card-img-${item.id}`}
                    style={{ display: 'none' }}
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const base64 = await resizeImageToBase64(file, 1200)
                      onUpdate(item.id, { image: base64 })
                    }}
                  />
                  <label htmlFor={`card-img-${item.id}`} className="proj-modal-image-input">
                    📷 이미지 변경
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="proj-modal-body">
            {isAdmin && !item.image && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id={`card-img-${item.id}`}
                  style={{ display: 'none' }}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const base64 = await resizeImageToBase64(file, 1200)
                    onUpdate(item.id, { image: base64 })
                  }}
                />
                <label htmlFor={`card-img-${item.id}`} className="proj-modal-image-add-btn">
                  + 커버 이미지 추가
                </label>
              </>
            )}

            {/* Title + Featured */}
            <div className="proj-modal-title-row">
              <InlineEditable tag="h2" className="proj-modal-title" onBlur={v => onUpdate(item.id, { title: v })}>
                {item.title}
              </InlineEditable>
              {item.featured && <span className="proj-modal-featured">⭐ Featured</span>}
              {isAdmin && (
                <button className="proj-modal-featured-toggle" onClick={() => onUpdate(item.id, { featured: !item.featured })}>
                  {item.featured ? '★ 해제' : '☆ Featured'}
                </button>
              )}
            </div>

            {/* Date */}
            <div className="proj-modal-date-row">
              <span className="proj-modal-date-icon">📅</span>
              <InlineEditable tag="span" className="proj-modal-date" onBlur={v => onUpdate(item.id, { date: v })}>
                {item.date}
              </InlineEditable>
            </div>

            {/* Short Description */}
            <InlineEditable tag="p" className="proj-modal-desc" onBlur={v => onUpdate(item.id, { desc: v })}>
              {item.desc}
            </InlineEditable>

            {/* Dynamic Info Cards */}
            {(infoCards.length > 0 || isAdmin) && (
              <div className="proj-modal-info-grid">
                {(() => {
                  const colorClasses = ['proj-modal-info-team', 'proj-modal-info-role', 'proj-modal-info-service']
                  return infoCards.map((card, idx) => {
                  const lines = card.value.split('\n').filter(Boolean)
                  const colorClass = colorClasses[idx % colorClasses.length]
                  return (
                    <div key={card.id} className={`proj-modal-info-card ${colorClass}`}>
                      {isAdmin ? (
                        <div className="info-card-edit">
                          <div className="info-card-edit-header">
                            <div style={{ position: 'relative' }}>
                              <button
                                className="info-card-icon-btn"
                                onClick={() => setIconPickerIdx(iconPickerIdx === idx ? null : idx)}
                                onMouseDown={e => e.stopPropagation()}
                                title="아이콘 선택"
                              >{card.icon}</button>
                              {iconPickerIdx === idx && (
                                <div className="icon-picker-popup" onMouseDown={e => e.stopPropagation()}>
                                  {PRESET_ICONS.map(em => (
                                    <button key={em} className="icon-picker-item"
                                      onClick={() => { updateInfoCard(idx, 'icon', em); setIconPickerIdx(null) }}>
                                      {em}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <input
                              className="info-card-label-input"
                              value={card.label}
                              onChange={e => updateInfoCard(idx, 'label', e.target.value)}
                              onMouseDown={e => e.stopPropagation()}
                            />
                            <button className="info-card-delete" onClick={() => removeInfoCard(idx)}>×</button>
                          </div>
                          <textarea
                            className="info-card-value-textarea"
                            value={card.value}
                            onChange={e => updateInfoCard(idx, 'value', e.target.value)}
                            placeholder="내용 입력..."
                            rows={3}
                            onMouseDown={e => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="proj-modal-info-icon">{card.icon}</div>
                          <p className="proj-modal-info-label">{card.label}</p>
                          {lines.length > 0
                            ? lines.map((line, i) => <p key={i} className="proj-modal-info-value">{line}</p>)
                            : <p className="proj-modal-info-value" style={{ opacity: 0.4 }}>—</p>
                          }
                        </>
                      )}
                    </div>
                  )
                })
              })()}
              </div>
            )}
            {isAdmin && (
              <button className="info-card-add-btn" onClick={addInfoCard}>+ 카드 추가</button>
            )}

            {/* Tags */}
            {(tags.length > 0 || isAdmin) && (
              <div className="proj-modal-tags-section">
                <div className="proj-modal-tags-list">
                  {tags.map((tag, i) => (
                    <span key={i} className="proj-modal-tag">
                      {tag}
                      {isAdmin && (
                        <button className="proj-modal-tag-remove" onClick={() => removeTag(i)}>×</button>
                      )}
                    </span>
                  ))}
                  {isAdmin && (
                    <div className="proj-modal-tag-add">
                      <input
                        ref={newTagRef}
                        type="text"
                        className="proj-modal-tag-input"
                        placeholder="태그 추가"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      />
                      <button className="proj-modal-tag-add-btn" onClick={addTag}>+</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detail Content */}
            <div className="proj-modal-detail-section">
              <p className="proj-modal-detail-label">상세 내용</p>
              <DetailBlockEditor
                blocks={item.detailBlocks ?? []}
                onChange={blocks => onUpdate(item.id, { detailBlocks: blocks })}
                isAdmin={isAdmin}
                placeholder="상세 내용을 작성하세요. (텍스트, 이미지, 영상을 자유롭게 추가 가능)"
              />
            </div>

            {/* Links */}
            {(() => {
              const links = item.links ?? []
              function updateLinks(next: string[]) {
                onUpdate(item.id, { links: next.length ? next : undefined })
              }
              return (
                <div className="proj-modal-link-section">
                  {links.map((url, idx) => (
                    <div key={idx} className="proj-modal-link-row">
                      {isAdmin && (
                        <div className="proj-modal-link-input-row">
                          <input
                            type="text"
                            className="proj-modal-link-input"
                            placeholder="링크 URL"
                            defaultValue={url}
                            onBlur={e => {
                              const v = e.target.value.trim()
                              if (!v) updateLinks(links.filter((_, i) => i !== idx))
                              else updateLinks(links.map((l, i) => i === idx ? v : l))
                            }}
                          />
                          <button className="proj-modal-link-remove" onClick={() => updateLinks(links.filter((_, i) => i !== idx))}>×</button>
                        </div>
                      )}
                      <LinkPreviewCard url={url} />
                    </div>
                  ))}
                  {showLinkInput && (
                    <input
                      type="text"
                      className="proj-modal-link-input"
                      placeholder="링크 URL 입력 후 Enter"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const v = (e.target as HTMLInputElement).value.trim()
                          if (v) updateLinks([...links, v])
                          setShowLinkInput(false)
                        }
                        if (e.key === 'Escape') setShowLinkInput(false)
                      }}
                      onBlur={e => {
                        const v = e.target.value.trim()
                        if (v) updateLinks([...links, v])
                        setShowLinkInput(false)
                      }}
                    />
                  )}
                  {isAdmin && !showLinkInput && (
                    <button className="proj-modal-link-add-btn" onClick={() => setShowLinkInput(true)}>
                      + 링크 추가
                    </button>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
