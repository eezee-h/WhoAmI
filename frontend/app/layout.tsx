import type { Metadata } from 'next'
import './globals.css'
import { EditorProvider } from '@/context/EditorContext'

export const metadata: Metadata = {
  title: 'WhoAmI',
  description: '나는 어떤 사람인가',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <EditorProvider>
          {children}
        </EditorProvider>
      </body>
    </html>
  )
}
