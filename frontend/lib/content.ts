import type { SiteContent } from './types'
import { apiGetContent, apiSaveContent } from './api'

export async function loadContent(username: string): Promise<SiteContent> {
  return apiGetContent(username)
}

export async function saveContent(data: SiteContent, username: string): Promise<void> {
  const password = sessionStorage.getItem('site-admin-password') ?? ''
  await apiSaveContent(username, password, data)
}
