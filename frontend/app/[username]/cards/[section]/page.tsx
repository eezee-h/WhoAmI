'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { loadContent, saveContent } from '@/lib/content'
import type { SiteContent, CardItem } from '@/lib/types'
import SaveButton from '@/components/SaveButton'
import CardModal from '@/components/CardModal'
import InlineEditable from '@/components/InlineEditable'
import { useEditor } from '@/context/EditorContext'

export default function CustomCardSectionPage() {
  const params = useParams()
  const username = decodeURIComponent(params.username as string)
  const sectionName = decodeURIComponent(params.section as string)

  const [content, setContent] = useState<SiteContent | null>(null)
  const contentRef = useRef<SiteContent | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const { isAdmin } = useEditor()

  useEffect(() => { loadContent(username).then(setContent) }, [username])
  useEffect(() => { contentRef.current = content }, [content])

  if (!content) return null

  const items = content.cards.filter(c => c.type === sectionName)
  const selectedItem = items.find(i => i.id === selectedId) ?? null
  const sectionDescription =
    content.homeSections.find(section => section.type === 'card' && section.name === sectionName)?.description?.trim()
    || `${sectionName} 섹션에 대한 설명을 입력하세요.`

  function updateItem(id: string, updates: Partial<CardItem>) {
    setContent(prev => {
      if (!prev) return prev
      return { ...prev, cards: prev.cards.map(c => c.id === id ? { ...c, ...updates } : c) }
    })
  }

  function updateSectionDescription(description: string) {
    setContent(prev => {
      if (!prev) return prev
      return {
        ...prev,
        homeSections: prev.homeSections.map(section =>
          section.type === 'card' && section.name === sectionName ? { ...section, description } : section,
        ),
      }
    })
  }

  function addItem() {
    const newItem: CardItem = {
      id: String(Date.now()),
      type: sectionName,
      title: `${sectionName} 이름`,
      date: '2026',
      desc: '내용을 입력하세요.',
    }
    setContent(prev => prev ? { ...prev, cards: [newItem, ...prev.cards] } : prev)
  }

  function removeItem(id: string) {
    setContent(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== id) } : prev)
    if (selectedId === id) setSelectedId(null)
  }

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null)
      setDragOverIdx(null)
      return
    }
    setContent(prev => {
      if (!prev) return prev
      const sectionIds = prev.cards.filter(c => c.type === sectionName).map(c => c.id)
      const fromId = sectionIds[dragIdx]
      const toId = sectionIds[toIdx]
      const fromGlobal = prev.cards.findIndex(c => c.id === fromId)
      const toGlobal = prev.cards.findIndex(c => c.id === toId)
      const next = [...prev.cards]
      const [moved] = next.splice(fromGlobal, 1)
      next.splice(toGlobal, 0, moved)
      return { ...prev, cards: next }
    })
    setDragIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="container">
      <div className="section-card project-title-card">
        <h1>{sectionName}</h1>
        <InlineEditable tag="p" onBlur={updateSectionDescription}>
          {sectionDescription}
        </InlineEditable>
      </div>

      <div className="projects-grid">
        {[...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((item, idx) => (
          <div
            key={item.id}
            className={`project-card section-card${dragOverIdx === idx && dragIdx !== idx ? ' card-drag-over' : ''}${dragIdx === idx ? ' card-dragging' : ''}`}
            draggable={isAdmin}
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
            onClick={() => { if (dragIdx === null) setSelectedId(item.id) }}
            style={{ cursor: isAdmin ? 'grab' : 'pointer' }}
          >
            <div className="project-image">
              {item.image
                ? <img src={item.image} alt={item.title} />
                : <span className="project-image-placeholder">🧩</span>
              }
              {item.featured && <span className="project-featured-badge">★ Featured</span>}
            </div>
            <div className="project-body">
              <div className="project-header">
                <h3 className="project-name">{item.title}</h3>
                <span className="project-date">{item.date}</span>
              </div>
              <p className="project-desc">{item.desc}</p>
              {(item.tags ?? []).length > 0 && (
                <div className="project-tags">
                  {(item.tags ?? []).map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                </div>
              )}
              {isAdmin && (
                <button className="btn-remove-project" onClick={e => { e.stopPropagation(); removeItem(item.id) }}>
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && !isAdmin && (
          <div className="section-card project-empty"><p>아직 내용이 없습니다.</p></div>
        )}
      </div>

      {isAdmin && (
        <button className="btn-add-record" onClick={addItem}>+ {sectionName} 추가</button>
      )}

      <SaveButton onSave={async () => { if (contentRef.current) await saveContent(contentRef.current, username) }} />

      {selectedItem && (
        <CardModal
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onUpdate={updateItem}
        />
      )}
    </div>
  )
}
