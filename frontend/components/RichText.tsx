import type { ElementType, ReactNode } from 'react'

interface Props {
  as?: ElementType
  className?: string
  text: string
}

const BOLD_RE = /\*\*(.+?)\*\*/g

export function renderRichText(text: string): ReactNode[] {
  const lines = text.split('\n')
  const nodes: ReactNode[] = []

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) nodes.push(<br key={`br-${lineIndex}`} />)

    let lastIndex = 0
    for (const match of line.matchAll(BOLD_RE)) {
      const [token, content] = match
      const start = match.index ?? 0

      if (start > lastIndex) {
        nodes.push(line.slice(lastIndex, start))
      }

      nodes.push(<strong key={`bold-${lineIndex}-${start}`}>{content}</strong>)
      lastIndex = start + token.length
    }

    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex))
    }
  })

  return nodes
}

export default function RichText({ as: Tag = 'span', className, text }: Props) {
  return <Tag className={className}>{renderRichText(text)}</Tag>
}
