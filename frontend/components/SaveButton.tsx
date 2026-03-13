'use client'

import { useEditor } from '@/context/EditorContext'
import { useState } from 'react'

interface Props {
  onSave: () => Promise<void>
  isDirty?: boolean
}

export default function SaveButton({ onSave, isDirty }: Props) {
  const { isAdmin } = useEditor()
  const [saved, setSaved] = useState(false)

  if (!isAdmin) return null

  async function handleSave() {
    await onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <button className="btn-save-float" onClick={handleSave}>
      {saved ? '저장됨 ✓' : '변경사항 저장'}
    </button>
  )
}
