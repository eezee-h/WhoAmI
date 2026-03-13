'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { userExists } from '@/lib/users'
import { applyTheme, ThemeKey } from '@/lib/theme'
import { apiGetTheme } from '@/lib/api'

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const username = decodeURIComponent(params.username as string)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    userExists(username).then(exists => {
      if (!exists) {
        router.replace('/')
      } else {
        apiGetTheme(username).then(theme => {
          applyTheme(theme as ThemeKey)
          setReady(true)
        })
      }
    })
  }, [username, router])

  if (!ready) return null

  return (
    <>
      <Header siteName={username} username={username} />
      <main className="site-main">{children}</main>
      <Footer />
    </>
  )
}
