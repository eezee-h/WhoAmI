'use client'

import { useEditor } from '@/context/EditorContext'
import { ElementType, useRef } from 'react'

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

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLParagraphElement & HTMLHeadingElement>}
      className={className}
      contentEditable={isAdmin}
      suppressContentEditableWarning
      onBlur={handleBlur}
      data-editable={isAdmin ? 'true' : undefined}
    >
      {children}
    </Tag>
  )
}
