'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import type { DetailBlock } from '@/lib/types'
import { resizeImageToBase64 } from '@/lib/imageUtils'
import RichText from './RichText'
import DetailImage from './DetailImage'
import { isBoldShortcut, wrapTextSelectionWithBold } from '@/lib/richText'

interface Props {
  blocks: DetailBlock[]
  onChange: (blocks: DetailBlock[]) => void
  isAdmin: boolean
  placeholder?: string
}

const MARKDOWN_HEADING_RE = /^(#{1,3})\s+(.+)$/
const IMAGE_SIZES = [
  { value: 'small', label: '작게' },
  { value: 'medium', label: '보통' },
  { value: 'full', label: '전체' },
] as const

interface TextBlockInputProps {
  block: DetailBlock
  onChange: (content: string) => void
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>
}

function TextBlockInput({ block, onChange, onKeyDown }: TextBlockInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Drag state must not trigger a resize. Preserve the modal's position while
    // temporarily shrinking the field to measure changed text or column width.
    const scrollContainer = textarea.closest<HTMLElement>('.proj-modal-scroll')
    const scrollTop = scrollContainer?.scrollTop ?? 0
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
    if (scrollContainer) scrollContainer.scrollTop = scrollTop
  }, [block.content, block.span])

  return (
    <textarea
      className="detail-block-textarea"
      ref={textareaRef}
      value={block.content}
      onChange={e => onChange(e.target.value)}
      placeholder="텍스트를 입력하세요..."
      rows={12}
      onMouseDown={e => e.stopPropagation()}
      onKeyDown={onKeyDown}
    />
  )
}

export default function DetailBlockEditor({ blocks, onChange, isAdmin, placeholder }: Props) {
  const [local, setLocal] = useState<DetailBlock[]>(blocks)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const reorderScroll = useRef<{ container: HTMLElement; top: number } | null>(null)
  const localRef = useRef(blocks)
  const mounted = useRef(true)
  const importingImages = useRef(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState('')

  useEffect(() => { localRef.current = blocks; setLocal(blocks) }, [blocks])
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useLayoutEffect(() => {
    // Restore once every moved text field has measured its new position.
    const pending = reorderScroll.current
    if (!pending) return
    pending.container.scrollTop = pending.top
    reorderScroll.current = null
  }, [local])

  function update(next: DetailBlock[]) {
    localRef.current = next
    setLocal(next)
    onChange(next)
  }

  function addText() {
    update([...local, { type: 'text', content: '', span: 'full' }])
  }

  async function importImages(files: File[]) {
    if (importingImages.current || files.length === 0) return
    importingImages.current = true
    setImageLoading(true)
    setImageError('')
    try {
      const images = await Promise.all(files.map(async file => ({
        type: 'image' as const,
        content: await resizeImageToBase64(file, 1200),
        span: 'full' as const,
        imageSize: 'medium' as const,
      })))
      if (mounted.current) update([...localRef.current, ...images])
    } catch {
      if (mounted.current) setImageError('사진을 불러오지 못했습니다. PNG 또는 JPEG 파일로 다시 시도해 주세요.')
    } finally {
      importingImages.current = false
      if (mounted.current) setImageLoading(false)
    }
  }

  function addImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => { void importImages(Array.from(input.files ?? [])) }
    input.click()
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(e.clipboardData.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return
    e.preventDefault()
    e.stopPropagation()
    if (importingImages.current) {
      setImageError('사진을 추가하는 중입니다. 잠시 후 다시 붙여넣어 주세요.')
      return
    }
    void importImages(files)
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

  function handleTextBoldShortcut(e: React.KeyboardEvent<HTMLTextAreaElement>, idx: number) {
    if (!isBoldShortcut(e.key, e.metaKey, e.ctrlKey)) return

    e.preventDefault()
    const target = e.currentTarget
    const { nextValue, nextSelectionStart, nextSelectionEnd } =
      wrapTextSelectionWithBold(target.value, target.selectionStart, target.selectionEnd)

    updateText(idx, nextValue)
    requestAnimationFrame(() => target.setSelectionRange(nextSelectionStart, nextSelectionEnd))
  }

  function toggleSpan(idx: number) {
    update(local.map((b, i) => i === idx ? { ...b, span: b.span === 'half' ? 'full' : 'half' } : b))
  }

  function handleDrop(toIdx: number, target: HTMLElement) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setDragOverIdx(null); return }
    const container = target.closest<HTMLElement>('.proj-modal-scroll')
    if (container) reorderScroll.current = { container, top: container.scrollTop }
    const next = [...local]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(toIdx, 0, moved)
    update(next)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  function renderTextBlock(block: DetailBlock, key: number) {
    const isFull = block.span !== 'half'
    const lines = block.content.split('\n')
    const hasMarkdownHeading = lines.some(line => MARKDOWN_HEADING_RE.test(line))
    const useLegacyHeading = block.textType === 'heading' && !hasMarkdownHeading

    return (
      <div key={key} className={`detail-block-text-view${isFull ? ' detail-block-view-full' : ''}`}>
        {lines.map((line, lineIdx) => {
          const heading = line.match(MARKDOWN_HEADING_RE)

          if (heading) {
            const level = heading[1].length
            const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4'

            return (
              <RichText
                key={`heading-${lineIdx}`}
                as={Tag}
                className={`proj-modal-detail-md-heading proj-modal-detail-md-heading-${level}`}
                text={heading[2]}
              />
            )
          }

          if (!line.trim()) {
            return <div key={`break-${lineIdx}`} className="proj-modal-detail-break" aria-hidden="true" />
          }

          return useLegacyHeading
            ? (
              <RichText
                key={`legacy-heading-${lineIdx}`}
                as="h3"
                className="proj-modal-detail-md-heading proj-modal-detail-md-heading-2"
                text={line}
              />
            )
            : <RichText key={`text-${lineIdx}`} as="p" className="proj-modal-detail-text" text={line} />
        })}
      </div>
    )
  }

  if (!isAdmin) {
    if (local.length === 0) return null
    return (
      <div className="detail-block-view">
        {local.map((block, i) => {
          if (block.type === 'image') {
            return (
              <div key={i} className={block.span !== 'half' ? 'detail-block-view-full' : undefined}>
                <DetailImage block={block} />
              </div>
            )
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
          return renderTextBlock(block, i)
        })}
      </div>
    )
  }

  return (
    <div className="detail-block-editor" tabIndex={0} aria-label="상세 내용 편집 및 사진 붙여넣기" onPaste={handlePaste}>
      <p className="detail-image-help">사진을 복사한 뒤 이 영역에서 Ctrl+V 또는 ⌘V로 붙여넣으세요. 사진은 맨 아래에 추가됩니다.</p>
      {imageLoading && <p className="detail-image-help" role="status">사진을 추가하는 중…</p>}
      {imageError && <p className="detail-image-error" role="alert">{imageError}</p>}
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
            onDrop={e => { e.preventDefault(); handleDrop(idx, e.currentTarget) }}
            onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
            style={{ cursor: 'grab' }}
          >
            <div className="detail-block-header">
              <span className="detail-block-drag-handle">⠿</span>
              <div className="detail-block-header-actions">
                {block.type === 'image' && (
                  <div className="detail-image-sizes" role="group" aria-label="사진 크기">
                    {IMAGE_SIZES.map(size => (
                      <button
                        key={size.value}
                        type="button"
                        aria-pressed={(block.imageSize ?? 'medium') === size.value}
                        onClick={() => update(local.map((item, i) => i === idx ? { ...item, imageSize: size.value } : item))}
                      >{size.label}</button>
                    ))}
                  </div>
                )}
                <button className="detail-block-span-toggle" onClick={() => toggleSpan(idx)} title={block.span === 'half' ? '전체 폭으로' : '절반 폭으로'}>
                  {block.span === 'half' ? '⬛⬛' : '⬜⬛'}
                </button>
                <button className="detail-block-remove" onClick={() => remove(idx)}>×</button>
              </div>
            </div>
            {block.type === 'text' ? (
              <TextBlockInput
                block={block}
                onChange={content => updateText(idx, content)}
                onKeyDown={e => handleTextBoldShortcut(e, idx)}
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
              <DetailImage block={block} />
            )}
          </div>
        ))}
      </div>

      <div className="detail-block-add-row">
        <button className="detail-block-add-btn" onClick={addText}>+ 텍스트</button>
        <button className="detail-block-add-btn" onClick={addImage} disabled={imageLoading}>+ 이미지</button>
        <button className="detail-block-add-btn" onClick={addEmbed}>+ 영상</button>
      </div>
    </div>
  )
}
