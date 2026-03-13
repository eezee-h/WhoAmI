'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { verifyUser } from '@/lib/users'

interface EditorContextType {
  isAdmin: boolean
  isDirty: boolean
  setDirty: (v: boolean) => void
  login: (username: string, id: string, password: string) => Promise<boolean>
  logout: () => void
}

const EditorContext = createContext<EditorContextType>({
  isAdmin: false,
  isDirty: false,
  setDirty: () => {},
  login: async () => false,
  logout: () => {},
})

export function EditorProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDirty, setDirty] = useState(false)

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem('site-admin') === 'true')
  }, [])

  async function login(username: string, id: string, password: string): Promise<boolean> {
    const ok = await verifyUser(username, id, password)
    if (!ok) return false
    sessionStorage.setItem('site-admin', 'true')
    sessionStorage.setItem('site-admin-password', password)
    setIsAdmin(true)
    return true
  }

  function logout() {
    sessionStorage.removeItem('site-admin')
    sessionStorage.removeItem('site-admin-password')
    setIsAdmin(false)
    setDirty(false)
  }

  return (
    <EditorContext.Provider value={{ isAdmin, isDirty, setDirty, login, logout }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  return useContext(EditorContext)
}
