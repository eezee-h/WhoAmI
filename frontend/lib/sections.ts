import type { HomeSection } from './types'

export function normalizeSectionSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[/%?#[\]@!$&'()*+,;=\\]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getSectionSlug(section: Pick<HomeSection, 'name' | 'slug'>): string {
  return normalizeSectionSlug(section.slug || section.name) || section.name.trim()
}

export function getCardSectionPath(username: string, section: Pick<HomeSection, 'name' | 'slug'>): string {
  return `/${username}/cards/${encodeURIComponent(getSectionSlug(section))}`
}
