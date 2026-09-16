'use client'

import { useEffect, useRef, useState } from 'react'
import type { DetailBlock } from '@/lib/types'

interface Props {
  block: DetailBlock
}

export default function DetailImage({ block }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [actualSize, setActualSize] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const imageSize = block.imageSize === 'small' || block.imageSize === 'full' ? block.imageSize : 'medium'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!expanded || !dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [expanded])

  function closePreview() {
    dialogRef.current?.close()
    buttonRef.current?.focus({ preventScroll: true })
    setExpanded(false)
    setActualSize(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`detail-image-open detail-image-${imageSize}`}
        aria-label="사진 크게 보기"
        title="사진 크게 보기"
        onClick={() => setExpanded(true)}
      >
        <img src={block.content} alt="상세 사진" className="detail-block-img" draggable={false} />
      </button>
      {expanded && (
        <dialog
          ref={dialogRef}
          className="image-viewer"
          aria-label="사진 크게 보기"
          onCancel={e => { e.preventDefault(); closePreview() }}
          onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation() }}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onPaste={e => e.stopPropagation()}
          onClick={e => { if (e.target === e.currentTarget) closePreview() }}
          onDragStart={e => { e.preventDefault(); e.stopPropagation() }}
        >
          <div className="image-viewer-toolbar">
            <button type="button" onClick={() => setActualSize(value => !value)} aria-pressed={actualSize}>
              {actualSize ? '화면에 맞추기' : '실제 크기로 보기'}
            </button>
            <button type="button" onClick={closePreview} aria-label="사진 확대 닫기" autoFocus>닫기 ✕</button>
          </div>
          <div className={`image-viewer-scroll${actualSize ? ' image-viewer-actual' : ''}`}>
            <img src={block.content} alt="확대한 상세 사진" draggable={false} />
          </div>
        </dialog>
      )}
    </>
  )
}
