'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadContent, saveContent } from '@/lib/content'
import type { SiteContent, ArchiveItem, CardItem, HomeSection } from '@/lib/types'
import { resizeImageToBase64 } from '@/lib/imageUtils'
import InlineEditable from '@/components/InlineEditable'
import SaveButton from '@/components/SaveButton'
import ConfirmModal from '@/components/ConfirmModal'
import { useEditor } from '@/context/EditorContext'

export default function UserHomePage() {
  const params = useParams()
  const username = decodeURIComponent(params.username as string)

  const [content, setContent] = useState<SiteContent | null>(null)
  const contentRef = useRef<SiteContent | null>(null)
  const isLoaded = useRef(false)
  const isInitialLoad = useRef(true)
  const [dragItemInfo, setDragItemInfo] = useState<{ category: string; idx: number } | null>(null)
  const [dragOverItemInfo, setDragOverItemInfo] = useState<{ category: string; idx: number } | null>(null)
  const [dragSectionIdx, setDragSectionIdx] = useState<number | null>(null)
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null)
  const [addMode, setAddMode] = useState<null | 'select' | 'archive' | 'card'>(null)
  const [newSectionName, setNewSectionName] = useState('')
  const { isAdmin, isDirty, setDirty } = useEditor()
  const router = useRouter()
  const [navConfirm, setNavConfirm] = useState<{ open: boolean; message: string; href: string; saveFirst: boolean }>({
    open: false, message: '', href: '', saveFirst: false,
  })

  function guardNav(e: React.MouseEvent, href: string) {
    if (!isDirty || !isAdmin) return
    e.preventDefault()
    setNavConfirm({ open: true, message: '저장하지 않은 변경사항이 있습니다.\n페이지를 떠나시겠습니까?', href, saveFirst: false })
  }

  function guardNavSave(e: React.MouseEvent, href: string) {
    if (!isDirty || !isAdmin) return
    e.preventDefault()
    setNavConfirm({ open: true, message: '저장하지 않은 변경사항이 있습니다.\n저장 후 이동하시겠습니까?', href, saveFirst: true })
  }

  useEffect(() => { loadContent(username).then(c => { setContent(c); isLoaded.current = true }) }, [username])
  useEffect(() => {
    contentRef.current = content
    if (isInitialLoad.current) {
      if (content) isInitialLoad.current = false
      return
    }
    if (isLoaded.current && content) setDirty(true)
  }, [content])

  useEffect(() => {
    if (!isDirty || !isAdmin) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, isAdmin])

  if (!content) return null

  const { home, cards, archive, homeSections } = content
  const activities = cards.filter(c => c.type === 'activity')
  const projects = cards.filter(c => c.type === 'project')

  function update<K extends keyof SiteContent['home']>(key: K, value: SiteContent['home'][K]) {
    setContent(prev => prev ? { ...prev, home: { ...prev.home, [key]: value } } : prev)
  }

  function updateArchive(id: string, key: 'title' | 'date' | 'desc' | 'link', value: string) {
    setContent(prev => {
      if (!prev) return prev
      return { ...prev, archive: prev.archive.map(item => item.id === id ? { ...item, [key]: value } : item) }
    })
  }

  function addArchiveItem(category: string) {
    const newItem: ArchiveItem = {
      id: String(Date.now()), category,
      title: '제목을 입력하세요', date: '2026', desc: '설명을 입력하세요.',
    }
    setContent(prev => prev ? { ...prev, archive: [newItem, ...prev.archive] } : prev)
  }

  function removeArchiveItem(id: string) {
    setContent(prev => prev ? { ...prev, archive: prev.archive.filter(i => i.id !== id) } : prev)
  }

  function removeCard(id: string) {
    setContent(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== id) } : prev)
  }

  function removeSection(id: string) {
    setContent(prev => {
      if (!prev) return prev
      const sec = prev.homeSections.find(s => s.id === id)
      if (!sec) return prev
      const next: SiteContent = { ...prev, homeSections: prev.homeSections.filter(s => s.id !== id) }
      if (sec.type === 'archive') next.archive = prev.archive.filter(i => i.category !== sec.name)
      if (sec.type === 'card') next.cards = prev.cards.filter(c => c.type !== sec.name)
      return next
    })
  }

  function addSection(type: 'archive' | 'card', name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setContent(prev => {
      if (!prev) return prev
      if (prev.homeSections.some(s => s.name === trimmed && s.type === type)) return prev
      const newSection: HomeSection = { id: `${type}-${Date.now()}`, type, name: trimmed }
      return { ...prev, homeSections: [...prev.homeSections, newSection] }
    })
  }

  function reorderSections(fromIdx: number, toIdx: number) {
    setContent(prev => {
      if (!prev) return prev
      const next = [...prev.homeSections]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return { ...prev, homeSections: next }
    })
  }

  function reorderArchiveItems(category: string, fromIdx: number, toIdx: number) {
    setContent(prev => {
      if (!prev) return prev
      const catItems = prev.archive.filter(i => i.category === category)
      const others = prev.archive.filter(i => i.category !== category)
      const [moved] = catItems.splice(fromIdx, 1)
      catItems.splice(toIdx, 0, moved)
      return { ...prev, archive: [...others, ...catItems] }
    })
  }

  function sectionDragProps(idx: number) {
    if (!isAdmin) return {}
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => { e.stopPropagation(); setDragSectionIdx(idx) },
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOverSectionIdx(idx) },
      onDragLeave: (e: React.DragEvent) => { e.stopPropagation(); setDragOverSectionIdx(null) },
      onDrop: (e: React.DragEvent) => {
        e.stopPropagation()
        if (dragSectionIdx !== null && dragSectionIdx !== idx) reorderSections(dragSectionIdx, idx)
        setDragSectionIdx(null); setDragOverSectionIdx(null)
      },
      onDragEnd: () => { setDragSectionIdx(null); setDragOverSectionIdx(null) },
    }
  }

  function sectionClass(idx: number) {
    let cls = 'section-card'
    if (dragOverSectionIdx === idx && dragSectionIdx !== idx) cls += ' card-drag-over'
    if (dragSectionIdx === idx) cls += ' card-dragging'
    return cls
  }

  function renderArchiveSection(sec: HomeSection, idx: number) {
    const items = archive.filter(i => i.category === sec.name)
    return (
      <section key={sec.id} className={sectionClass(idx)} {...sectionDragProps(idx)}>
        <div className="resume-section-title">
          <span>{sec.name}</span>
          {isAdmin && <button className="btn-remove-project" onClick={() => removeSection(sec.id)}>섹션 삭제</button>}
        </div>
        {items.length === 0 && !isAdmin && <p className="resume-empty">아직 내용이 없습니다.</p>}
        {items.map((item, itemIdx) => (
          <div
            key={item.id}
            className={`resume-item${dragOverItemInfo?.category === sec.name && dragOverItemInfo?.idx === itemIdx && dragItemInfo?.idx !== itemIdx ? ' resume-item-drag-over' : ''}${dragItemInfo?.category === sec.name && dragItemInfo?.idx === itemIdx ? ' resume-item-dragging' : ''}`}
            draggable={isAdmin}
            onDragStart={e => { e.stopPropagation(); setDragItemInfo({ category: sec.name, idx: itemIdx }) }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverItemInfo({ category: sec.name, idx: itemIdx }) }}
            onDragLeave={e => { e.stopPropagation(); setDragOverItemInfo(null) }}
            onDrop={e => {
              e.stopPropagation()
              if (dragItemInfo?.category === sec.name && dragItemInfo.idx !== itemIdx) reorderArchiveItems(sec.name, dragItemInfo.idx, itemIdx)
              setDragItemInfo(null); setDragOverItemInfo(null)
            }}
            onDragEnd={e => { e.stopPropagation(); setDragItemInfo(null); setDragOverItemInfo(null) }}
            onClick={() => { if (!isAdmin && item.link && !window.getSelection()?.toString()) window.open(item.link, '_blank', 'noopener,noreferrer') }}
            style={isAdmin ? { cursor: 'grab' } : item.link ? { cursor: 'pointer' } : undefined}
          >
            <div className="resume-item-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <InlineEditable tag="span" className="resume-item-title" onBlur={v => updateArchive(item.id, 'title', v)}>{item.title}</InlineEditable>
                {item.link && !isAdmin && <span className="resume-item-link-icon">🔗</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <InlineEditable tag="span" className="resume-item-date" onBlur={v => updateArchive(item.id, 'date', v)}>{item.date}</InlineEditable>
                {isAdmin && <button className="btn-remove-project" onClick={() => removeArchiveItem(item.id)}>삭제</button>}
              </div>
            </div>
            <InlineEditable tag="p" className="resume-item-desc" onBlur={v => updateArchive(item.id, 'desc', v)}>{item.desc}</InlineEditable>
            {isAdmin && (
              <input className="resume-item-link-input" placeholder="링크 URL (없으면 비워두세요)"
                value={item.link ?? ''} onChange={e => updateArchive(item.id, 'link', e.target.value)}
                onMouseDown={e => e.stopPropagation()} />
            )}
          </div>
        ))}
        {isAdmin && <button className="btn-add-record" onClick={() => addArchiveItem(sec.name)}>+ {sec.name} 추가</button>}
      </section>
    )
  }

  function renderActivitySection(sec: HomeSection, idx: number) {
    return (
      <section key={sec.id} className={sectionClass(idx)} {...sectionDragProps(idx)}>
        <div className="resume-section-title">
          <span>대외활동</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href={`/${username}/activities`} className="section-more" onClick={e => guardNavSave(e, `/${username}/activities`)}>전체 보기 →</Link>
            {isAdmin && <button className="btn-remove-project" onClick={() => removeSection(sec.id)}>섹션 삭제</button>}
          </div>
        </div>
        {activities.length === 0 && !isAdmin && <p className="resume-empty">아직 내용이 없습니다.</p>}
        {[...activities].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map(item => (
          <div key={item.id} className="resume-item">
            <div className="resume-item-header">
              <span className="resume-item-title">{item.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="resume-item-date">{item.date}</span>
                {isAdmin && <button className="btn-remove-project" onClick={() => removeCard(item.id)}>삭제</button>}
              </div>
            </div>
            <p className="resume-item-desc">{item.desc}</p>
          </div>
        ))}
      </section>
    )
  }

  function renderProjectSection(sec: HomeSection, idx: number) {
    return (
      <section key={sec.id} className={sectionClass(idx)} {...sectionDragProps(idx)}>
        <div className="resume-section-title">
          <span>프로젝트</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href={`/${username}/projects`} className="section-more" onClick={e => guardNavSave(e, `/${username}/projects`)}>전체 보기 →</Link>
            {isAdmin && <button className="btn-remove-project" onClick={() => removeSection(sec.id)}>섹션 삭제</button>}
          </div>
        </div>
        {projects.length === 0 && !isAdmin && <p className="resume-empty">아직 내용이 없습니다.</p>}
        {[...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map(project => (
          <div key={project.id} className="resume-item">
            <div className="resume-item-header">
              <span className="resume-item-title">{project.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="resume-item-date">{project.date}</span>
                {isAdmin && <button className="btn-remove-project" onClick={() => removeCard(project.id)}>삭제</button>}
              </div>
            </div>
            <p className="resume-item-desc">{project.desc}</p>
            {(project.tags ?? []).length > 0 && (
              <div className="project-tags" style={{ marginTop: '0.5rem' }}>
                {(project.tags ?? []).map((tag, i) => <span key={i} className="tag">{tag}</span>)}
              </div>
            )}
          </div>
        ))}
      </section>
    )
  }

  function renderCardSection(sec: HomeSection, idx: number) {
    const sectionCards = cards.filter(c => c.type === sec.name)
    return (
      <section key={sec.id} className={sectionClass(idx)} {...sectionDragProps(idx)}>
        <div className="resume-section-title">
          <span>{sec.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href={`/${username}/cards/${encodeURIComponent(sec.name)}`} className="section-more" onClick={e => guardNavSave(e, `/${username}/cards/${encodeURIComponent(sec.name)}`)}>전체 보기 →</Link>
            {isAdmin && <button className="btn-remove-project" onClick={() => removeSection(sec.id)}>섹션 삭제</button>}
          </div>
        </div>
        {sectionCards.length === 0 && !isAdmin && <p className="resume-empty">아직 내용이 없습니다.</p>}
        {[...sectionCards].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map(item => (
          <div key={item.id} className="resume-item">
            <div className="resume-item-header">
              <span className="resume-item-title">{item.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="resume-item-date">{item.date}</span>
                {isAdmin && <button className="btn-remove-project" onClick={() => removeCard(item.id)}>삭제</button>}
              </div>
            </div>
            <p className="resume-item-desc">{item.desc}</p>
          </div>
        ))}
      </section>
    )
  }

  return (
    <div className="container">
      {/* Hero */}
      <section className="section-card hero">
        <div className="hero-photo-wrap">
          {home.avatar
            ? <img src={home.avatar} alt={home.name} className="hero-photo"
                style={{ objectPosition: `${home.avatarX ?? 50}% ${home.avatarY ?? 50}%` }} />
            : <div className="hero-photo hero-photo-placeholder">😊</div>
          }
          {isAdmin && (
            <>
              <input type="file" accept="image/*" id="hero-photo-file" style={{ display: 'none' }}
                onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return
                  const base64 = await resizeImageToBase64(file, 600)
                  update('avatar', base64 as any)
                }} />
              <label htmlFor="hero-photo-file" className="hero-photo-upload-btn">📷 사진 변경</label>
              {home.avatar && (
                <div className="hero-photo-pos">
                  <div className="hero-photo-pos-row">
                    <span>↔</span>
                    <input type="range" min={0} max={100} value={home.avatarX ?? 50}
                      onChange={e => update('avatarX', Number(e.target.value) as any)} className="hero-photo-slider" />
                  </div>
                  <div className="hero-photo-pos-row">
                    <span>↕</span>
                    <input type="range" min={0} max={100} value={home.avatarY ?? 50}
                      onChange={e => update('avatarY', Number(e.target.value) as any)} className="hero-photo-slider" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="hero-content">
          <InlineEditable tag="h1" className="hero-name" onBlur={v => update('name', v)}>{home.name}</InlineEditable>
          <InlineEditable tag="p" className="hero-tagline" onBlur={v => update('tagline', v)}>{home.tagline}</InlineEditable>
          <InlineEditable tag="p" className="hero-snapshot" onBlur={v => update('snapshot', v)}>{home.snapshot}</InlineEditable>
          <div className="cta">
            <Link href={`/${username}/contact`} className="btn-ghost">연락하기</Link>
          </div>
          <div className="keywords-list">
            {home.keywords.map((kw, i) => (
              <span key={i} className="tag keyword-tag-wrap">
                <InlineEditable tag="span" className="keyword-tag-text"
                  onBlur={v => { const next = [...home.keywords]; next[i] = v; update('keywords', next) }}>
                  {kw}
                </InlineEditable>
                {isAdmin && (
                  <button className="keyword-tag-remove"
                    onClick={() => update('keywords', home.keywords.filter((_, j) => j !== i))}>×</button>
                )}
              </span>
            ))}
            {isAdmin && (
              <form className="keyword-add-form" onSubmit={e => {
                e.preventDefault()
                const input = e.currentTarget.elements[0] as HTMLInputElement
                const val = input.value.trim()
                if (val) { update('keywords', [...home.keywords, val]); input.value = '' }
              }}>
                <input className="keyword-add-input" placeholder="키워드 추가" />
                <button type="submit" className="keyword-add-btn">+</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 동적 섹션 렌더링 */}
      {homeSections.map((sec, idx) => {
        if (sec.type === 'archive') return renderArchiveSection(sec, idx)
        if (sec.type === 'activity') return renderActivitySection(sec, idx)
        if (sec.type === 'project') return renderProjectSection(sec, idx)
        if (sec.type === 'card') return renderCardSection(sec, idx)
        return null
      })}

      {isAdmin && (
        <button className="btn-add-record" onClick={() => { setNewSectionName(''); setAddMode('select') }}>
          + 섹션 추가
        </button>
      )}

      {addMode && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setAddMode(null)}>
          <div className="modal">
            <h2>섹션 추가</h2>
            {addMode === 'select' && (
              <>
                <p>추가할 섹션 종류를 선택하세요.</p>
                <div className="modal-actions">
                  <button className="btn-primary" onClick={() => { setNewSectionName(''); setAddMode('archive') }}>기록 섹션</button>
                  <button className="btn-primary" onClick={() => { setNewSectionName(''); setAddMode('card') }}>카드 섹션</button>
                </div>
              </>
            )}
            {(addMode === 'archive' || addMode === 'card') && (
              <>
                <p>{addMode === 'archive' ? '기록 섹션' : '카드 섹션'} 이름을 입력하세요.</p>
                <input
                  className="resume-item-link-input"
                  placeholder={addMode === 'archive' ? '예: 봉사활동, 어학...' : '예: 스터디, 수상...'}
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newSectionName.trim()) {
                      addSection(addMode, newSectionName.trim()); setAddMode(null)
                    }
                  }}
                  autoFocus
                />
                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button className="btn-cancel" onClick={() => setAddMode('select')}>← 뒤로</button>
                  <button className="btn-primary" disabled={!newSectionName.trim()}
                    onClick={() => { addSection(addMode, newSectionName.trim()); setAddMode(null) }}>
                    만들기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <SaveButton
        isDirty={isDirty}
        onSave={async () => {
          if (contentRef.current) {
            await saveContent(contentRef.current, username)
            setDirty(false)
          }
        }}
      />
      <ConfirmModal
        open={navConfirm.open}
        message={navConfirm.message}
        confirmLabel={navConfirm.saveFirst ? '저장 후 이동' : '페이지 이동'}
        onCancel={() => setNavConfirm(prev => ({ ...prev, open: false }))}
        onConfirm={async () => {
          if (navConfirm.saveFirst && contentRef.current) {
            await saveContent(contentRef.current, username)
            setDirty(false)
          }
          const href = navConfirm.href
          setNavConfirm(prev => ({ ...prev, open: false }))
          router.push(href)
        }}
      />
    </div>
  )
}
