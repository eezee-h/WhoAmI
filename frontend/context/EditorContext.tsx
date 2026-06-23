'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { verifyUser } from '@/lib/users'

interface EditorContextType {
  isAdmin: boolean
  isAuthenticated: boolean
  isDirty: boolean
  setDirty: (v: boolean) => void
  storeSession: (password: string) => void
  login: (username: string, id: string, password: string) => Promise<boolean>
  startEditing: () => void
  stopEditing: () => void
  logout: () => void
}

const EditorContext = createContext<EditorContextType>({
  isAdmin: false,
  isAuthenticated: false,
  isDirty: false,
  setDirty: () => {},
  storeSession: () => {},
  login: async () => false,
  startEditing: () => {},
  stopEditing: () => {},
  logout: () => {},
})

export function EditorProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDirty, setDirty] = useState(false)

  useEffect(() => {
    const authenticated = sessionStorage.getItem('site-admin') === 'true'
    setIsAuthenticated(authenticated)
    setIsAdmin(authenticated && sessionStorage.getItem('site-editing') !== 'false')
  }, [])

  function storeSession(password: string) {
    sessionStorage.setItem('site-admin', 'true')
    sessionStorage.setItem('site-editing', 'true')
    sessionStorage.setItem('site-admin-password', password)
    setIsAuthenticated(true)
    setIsAdmin(true)
  }

  async function login(username: string, id: string, password: string): Promise<boolean> {
    const ok = await verifyUser(username, id, password)
    if (!ok) return false
    storeSession(password)
    return true
  }

  function startEditing() {
    if (sessionStorage.getItem('site-admin') !== 'true') return
    sessionStorage.setItem('site-editing', 'true')
    setIsAuthenticated(true)
    setIsAdmin(true)
  }

  function stopEditing() {
    sessionStorage.setItem('site-editing', 'false')
    setIsAdmin(false)
  }

  function logout() {
    sessionStorage.removeItem('site-admin')
    sessionStorage.removeItem('site-editing')
    sessionStorage.removeItem('site-admin-password')
    setIsAuthenticated(false)
    setIsAdmin(false)
    setDirty(false)
  }

  return (
    <EditorContext.Provider value={{ isAdmin, isAuthenticated, isDirty, setDirty, storeSession, login, startEditing, stopEditing, logout }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  return useContext(EditorContext)
}
