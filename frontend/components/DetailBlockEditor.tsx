'use client'

import { useState, useEffect } from 'react'
import type { DetailBlock } from '@/lib/types'
import { resizeImageToBase64 } from '@/lib/imageUtils'

interface Props {
  blocks: DetailBlock[]
  onChange: (blocks: DetailBlock[]) => void
  isAdmin: boolean
  placeholder?: string
}

export default function DetailBlockEditor({ blocks, onChange, isAdmin, placeholder }: Props) {
  const [local, setLocal] = useState<DetailBlock[]>(blocks)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  useEffect(() => { setLocal(blocks) }, [blocks])

  function update(next: DetailBlock[]) {
    setLocal(next)
    onChange(next)
  }

  function addText() {
    update([...local, { type: 'text', content: '', span: 'full' }])
  }

  function addImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const base64 = await resizeImageToBase64(file, 1200)
      update([...local, { type: 'image', content: base64, span: 'full' }])
    }
    input.click()
  }

  function addEmbed() {
    update([...local, { type: 'embed', content: '', span: 'full' }])
  }

  function toEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url)
      // YouTube
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}`
      }
      if (u.hostname.includes('youtu.be')) {
        const v = u.pathname.slice(1)
        if (v) return `https://www.youtube.com/embed/${v}`
      }
      // Vimeo
      if (u.hostname.includes('vimeo.com')) {
        const v = u.pathname.slice(1)
        if (v) return `https://player.vimeo.com/video/${v}`
      }
      return null
    } catch {
      return null
    }
  }

  function remove(idx: number) {
    update(local.filter((_, i) => i !== idx))
  }

  function updateText(idx: number, content: string) {
    update(local.map((b, i) => i === idx ? { ...b, content } : b))
  }

  function toggleSpan(idx: number) {
    update(local.map((b, i) => i === idx ? { ...b, span: b.span === 'half' ? 'full' : 'half' } : b))
  }

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setDragOverIdx(null); return }
    const next = [...local]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(toIdx, 0, moved)
    update(next)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  if (!isAdmin) {
    if (local.length === 0) return null
    return (
      <div className="detail-block-view">
        {local.map((block, i) => {
          if (block.type === 'image') {
            return <img key={i} src={block.content} alt="" className={`detail-block-img${block.span !== 'half' ? ' detail-block-view-full' : ''}`} />
          }
          if (block.type === 'embed') {
            const embedUrl = toEmbedUrl(block.content)
            if (!embedUrl) return null
            return (
              <div key={i} className={`detail-block-embed-wrap${block.span !== 'half' ? ' detail-block-view-full' : ''}`}>
                <iframe src={embedUrl} allowFullScreen className="detail-block-embed" />
              </div>
            )
          }
          if (!block.content) return null
          return block.textType === 'heading'
            ? <h3 key={i} className={`proj-modal-detail-heading${block.span !== 'half' ? ' detail-block-view-full' : ''}`}>{block.content}</h3>
            : <p key={i} className={`proj-modal-detail-text${block.span !== 'half' ? ' detail-block-view-full' : ''}`}>{block.content}</p>
        })}
      </div>
    )
  }

  return (
    <div className="detail-block-editor">
      {local.length === 0 && (
        <p className="detail-block-placeholder">{placeholder || '내용을 추가하세요.'}</p>
      )}

      <div className="detail-block-grid">
        {local.map((block, idx) => (
          <div
            key={idx}
            className={`detail-block-item${block.span !== 'half' ? ' detail-block-full' : ''}${dragOverIdx === idx && dragIdx !== idx ? ' detail-block-drag-over' : ''}${dragIdx === idx ? ' detail-block-dragging' : ''}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
            style={{ cursor: 'grab' }}
          >
            <div className="detail-block-header">
              <span className="detail-block-drag-handle">⠿</span>
              <div className="detail-block-header-actions">
                {block.type === 'text' && (
                  <button
                    className={`detail-block-type-toggle${block.textType === 'heading' ? ' active' : ''}`}
                    onClick={() => update(local.map((b, i) => i === idx ? { ...b, textType: b.textType === 'heading' ? 'normal' : 'heading' } : b))}
                    title="제목/본문 전환"
                  >
                    {block.textType === 'heading' ? 'H' : 'T'}
                  </button>
                )}
                <button className="detail-block-span-toggle" onClick={() => toggleSpan(idx)} title={block.span === 'half' ? '전체 폭으로' : '절반 폭으로'}>
                  {block.span === 'half' ? '⬛⬛' : '⬜⬛'}
                </button>
                <button className="detail-block-remove" onClick={() => remove(idx)}>×</button>
              </div>
            </div>
            {block.type === 'text' ? (
              <textarea
                className="detail-block-textarea"
                value={block.content}
                onChange={e => updateText(idx, e.target.value)}
                placeholder="텍스트를 입력하세요..."
                rows={4}
                onMouseDown={e => e.stopPropagation()}
              />
            ) : block.type === 'embed' ? (
              <div className="detail-block-embed-edit" onMouseDown={e => e.stopPropagation()}>
                <input
                  className="detail-block-embed-input"
                  type="text"
                  value={block.content}
                  onChange={e => updateText(idx, e.target.value)}
                  placeholder="YouTube 또는 Vimeo URL을 입력하세요..."
                />
                {block.content && (() => {
                  const embedUrl = toEmbedUrl(block.content)
                  return embedUrl ? (
                    <div className="detail-block-embed-wrap">
                      <iframe src={embedUrl} allowFullScreen className="detail-block-embed" />
                    </div>
                  ) : (
                    <p className="detail-block-embed-error">지원하지 않는 URL입니다. YouTube 또는 Vimeo URL을 입력하세요.</p>
                  )
                })()}
              </div>
            ) : (
              <div className="detail-block-image-wrap">
                <img src={block.content} alt="" className="detail-block-img" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="detail-block-add-row">
        <button className="detail-block-add-btn" onClick={addText}>+ 텍스트</button>
        <button className="detail-block-add-btn" onClick={addImage}>+ 이미지</button>
        <button className="detail-block-add-btn" onClick={addEmbed}>+ 영상</button>
      </div>
    </div>
  )
}
