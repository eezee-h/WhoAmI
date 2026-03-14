'use client'

import { useEffect, useState } from 'react'

interface OGData {
  title: string
  description: string
  image: string
  domain: string
}

interface Props {
  url: string
}

export default function LinkPreviewCard({ url }: Props) {
  const [data, setData] = useState<OGData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) return
    setLoading(true)
    setError(false)
    setData(null)

    fetch(`/meta/og?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(true)
        else setData(d)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [url])

  if (loading) {
    return (
      <div className="link-preview-card link-preview-loading">
        <div className="link-preview-skeleton" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-card link-preview-fallback">
        <span className="link-preview-fallback-icon">🔗</span>
        <span className="link-preview-fallback-url">{url}</span>
        <span className="link-preview-arrow">↗</span>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-preview-card"
    >
      {data.image && (
        <div className="link-preview-image-wrap">
          <img src={data.image} alt={data.title} className="link-preview-image" />
        </div>
      )}
      <div className="link-preview-content">
        {data.title && <p className="link-preview-title">{data.title}</p>}
        {data.description && <p className="link-preview-desc">{data.description}</p>}
        <p className="link-preview-domain">🔗 {data.domain}</p>
      </div>
    </a>
  )
}
