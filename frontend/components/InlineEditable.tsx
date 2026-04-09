'use client'

import { useEditor } from '@/context/EditorContext'
import { ElementType, useRef } from 'react'
import RichText from './RichText'
import { isBoldShortcut, wrapContentEditableSelectionWithBold } from '@/lib/richText'

interface Props {
  tag?: ElementType
  className?: string
  children: string
  onBlur?: (value: string) => void
}

export default function InlineEditable({
  tag: Tag = 'span',
  className,
  children,
  onBlur,
}: Props) {
  const { isAdmin } = useEditor()
  const ref = useRef<HTMLElement>(null)

  function handleBlur() {
    if (ref.current && onBlur) {
      onBlur(ref.current.innerText)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (!isAdmin || !ref.current) return
    if (!isBoldShortcut(e.key, e.metaKey, e.ctrlKey)) return

    e.preventDefault()
    wrapContentEditableSelectionWithBold(ref.current)
  }

  if (!isAdmin) {
    return <RichText as={Tag} className={className} text={children} />
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLParagraphElement & HTMLHeadingElement>}
      className={className}
      contentEditable={isAdmin}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-editable={isAdmin ? 'true' : undefined}
    >
      {children}
    </Tag>
  )
}
