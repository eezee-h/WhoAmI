export type ArchiveCategory = string

export interface DetailBlock {
  type: 'text' | 'image' | 'embed'
  content: string
  span?: 'full' | 'half'
  textType?: 'normal' | 'heading'
}

export interface ArchiveItem {
  id: string
  category: ArchiveCategory
  title: string
  date: string
  desc: string
  featured?: boolean
  image?: string
  link?: string
}

export interface InfoCard {
  id: string
  icon: string
  label: string
  value: string
}

export type CardType = string

export interface CardItem {
  id: string
  type: CardType
  title: string
  date: string
  desc: string
  featured?: boolean
  image?: string
  links?: string[]
  detailBlocks?: DetailBlock[]
  infoCards?: InfoCard[]
  tags?: string[]
}

export type HomeSectionType = 'archive' | 'activity' | 'project' | 'card'

export interface HomeSection {
  id: string
  type: HomeSectionType
  name: string
}

export type ContactType = 'email' | 'github' | 'instagram' | 'linkedin' | 'twitter' | 'facebook'

export interface ContactLink {
  id: string
  type: ContactType
  value: string
}

export interface SiteContent {
  home: {
    name: string
    tagline: string
    snapshot: string
    keywords: string[]
    avatar?: string
    avatarX?: number
    avatarY?: number
  }
  homeSections: HomeSection[]
  archive: ArchiveItem[]
  cards: CardItem[]
  contact: ContactLink[]
}
