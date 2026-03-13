export type ThemeKey = 'red' | 'pink' | 'orange' | 'brown' | 'yellow' | 'green' | 'teal' | 'blue' | 'violet' | 'black'

export interface Theme {
  label: string
  swatch: string
  vars: Record<string, string>
}

export const THEMES: Record<ThemeKey, Theme> = {
  red: {
    label: 'Red',
    swatch: '#e11d48',
    vars: {
      '--color-primary': '#e11d48',
      '--color-primary-hover': '#be123c',
      '--color-primary-soft': '#ffe4e6',
      '--color-text-main': '#3b0a1f',
      '--color-text-sub': '#8a4a5e',
      '--color-border': 'rgba(225,29,72,0.14)',
      '--shadow': '0 24px 70px rgba(190,18,60,0.12)',
      '--shadow-card': '0 12px 42px rgba(190,18,60,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(253,205,215,0.09),transparent 28%),radial-gradient(circle at bottom right,rgba(225,29,72,0.04),transparent 26%),linear-gradient(180deg,#ffffff 0%,#fffbfc 52%,#fff5f7 100%)',
      '--footer-bg': '#3b0a1f',
    },
  },
  pink: {
    label: 'Pink',
    swatch: '#ff82b2',
    vars: {
      '--color-primary': '#ff82b2',
      '--color-primary-hover': '#e8649a',
      '--color-primary-soft': '#ffeef6',
      '--color-text-main': '#3a1428',
      '--color-text-sub': '#b07090',
      '--color-border': 'rgba(255,130,178,0.18)',
      '--shadow': '0 24px 70px rgba(232,100,154,0.10)',
      '--shadow-card': '0 12px 42px rgba(232,100,154,0.06)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(255,182,215,0.09),transparent 30%),radial-gradient(circle at bottom right,rgba(255,130,178,0.04),transparent 28%),linear-gradient(180deg,#ffffff 0%,#fffcfe 52%,#fff7fb 100%)',
      '--footer-bg': '#3a1428',
    },
  },
  orange: {
    label: 'Orange',
    swatch: '#ea580c',
    vars: {
      '--color-primary': '#ea580c',
      '--color-primary-hover': '#c2410c',
      '--color-primary-soft': '#ffedd5',
      '--color-text-main': '#3a1a06',
      '--color-text-sub': '#8a5c3a',
      '--color-border': 'rgba(234,88,12,0.14)',
      '--shadow': '0 24px 70px rgba(194,65,12,0.12)',
      '--shadow-card': '0 12px 42px rgba(194,65,12,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(254,215,170,0.09),transparent 28%),radial-gradient(circle at bottom right,rgba(234,88,12,0.04),transparent 26%),linear-gradient(180deg,#ffffff 0%,#fffdf9 52%,#fffaf3 100%)',
      '--footer-bg': '#3a1a06',
    },
  },
  brown: {
    label: 'Brown',
    swatch: '#92400e',
    vars: {
      '--color-primary': '#92400e',
      '--color-primary-hover': '#78350f',
      '--color-primary-soft': '#fde68a',
      '--color-text-main': '#2c1a0a',
      '--color-text-sub': '#7c5a3a',
      '--color-border': 'rgba(146,64,14,0.16)',
      '--shadow': '0 24px 70px rgba(120,53,15,0.12)',
      '--shadow-card': '0 12px 42px rgba(120,53,15,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(253,230,138,0.2),transparent 28%),radial-gradient(circle at bottom right,rgba(146,64,14,0.06),transparent 26%),linear-gradient(180deg,#ffffff 0%,#fdf8f3 52%,#faf0e6 100%)',
      '--footer-bg': '#2c1a0a',
    },
  },
  yellow: {
    label: 'Yellow',
    swatch: '#FEE500',
    vars: {
      '--color-primary': '#D4A017',
      '--color-primary-hover': '#B8860B',
      '--color-primary-soft': '#FFF9C4',
      '--color-text-main': '#2d2200',
      '--color-text-sub': '#8a6e00',
      '--color-border': 'rgba(212,160,23,0.2)',
      '--shadow': '0 24px 70px rgba(180,134,11,0.12)',
      '--shadow-card': '0 12px 42px rgba(180,134,11,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(254,229,0,0.08),transparent 28%),radial-gradient(circle at bottom right,rgba(212,160,23,0.05),transparent 26%),linear-gradient(180deg,#ffffff 0%,#fffef5 52%,#fffde8 100%)',
      '--footer-bg': '#2d2200',
    },
  },
  green: {
    label: 'Green',
    swatch: '#059669',
    vars: {
      '--color-primary': '#059669',
      '--color-primary-hover': '#047857',
      '--color-primary-soft': '#d1fae5',
      '--color-text-main': '#052e1c',
      '--color-text-sub': '#3d7a5f',
      '--color-border': 'rgba(5,150,105,0.14)',
      '--shadow': '0 24px 70px rgba(4,120,87,0.12)',
      '--shadow-card': '0 12px 42px rgba(4,120,87,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(167,243,208,0.09),transparent 28%),radial-gradient(circle at bottom right,rgba(5,150,105,0.04),transparent 26%),linear-gradient(180deg,#ffffff 0%,#f9fdfb 52%,#f3fbf7 100%)',
      '--footer-bg': '#052e1c',
    },
  },
  teal: {
    label: 'Teal',
    swatch: '#0d9488',
    vars: {
      '--color-primary': '#0d9488',
      '--color-primary-hover': '#0f766e',
      '--color-primary-soft': '#ccfbf1',
      '--color-text-main': '#042f2e',
      '--color-text-sub': '#2d7d74',
      '--color-border': 'rgba(13,148,136,0.14)',
      '--shadow': '0 24px 70px rgba(15,118,110,0.12)',
      '--shadow-card': '0 12px 42px rgba(15,118,110,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(153,246,228,0.12),transparent 28%),radial-gradient(circle at bottom right,rgba(13,148,136,0.05),transparent 26%),linear-gradient(180deg,#ffffff 0%,#f0fdfa 52%,#e6faf7 100%)',
      '--footer-bg': '#042f2e',
    },
  },
  blue: {
    label: 'Blue',
    swatch: '#2276f5',
    vars: {
      '--color-primary': '#2276f5',
      '--color-primary-hover': '#1559bf',
      '--color-primary-soft': '#d8ebff',
      '--color-text-main': '#11243f',
      '--color-text-sub': '#50729a',
      '--color-border': 'rgba(34,118,245,0.14)',
      '--shadow': '0 24px 70px rgba(34,84,156,0.12)',
      '--shadow-card': '0 12px 42px rgba(34,84,156,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(120,190,255,0.26),transparent 28%),radial-gradient(circle at bottom right,rgba(44,118,245,0.14),transparent 26%),linear-gradient(180deg,#f7fbff 0%,#edf5ff 52%,#e7f0fb 100%)',
      '--footer-bg': '#0f1f35',
    },
  },
  violet: {
    label: 'Violet',
    swatch: '#7c3aed',
    vars: {
      '--color-primary': '#7c3aed',
      '--color-primary-hover': '#5b21b6',
      '--color-primary-soft': '#ede9fe',
      '--color-text-main': '#1e1030',
      '--color-text-sub': '#6b5b8a',
      '--color-border': 'rgba(124,58,237,0.14)',
      '--shadow': '0 24px 70px rgba(91,33,182,0.12)',
      '--shadow-card': '0 12px 42px rgba(91,33,182,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(196,181,253,0.09),transparent 28%),radial-gradient(circle at bottom right,rgba(124,58,237,0.04),transparent 26%),linear-gradient(180deg,#ffffff 0%,#fbfaff 52%,#f7f4ff 100%)',
      '--footer-bg': '#1a0d2e',
    },
  },
  black: {
    label: 'Black',
    swatch: '#475569',
    vars: {
      '--color-primary': '#475569',
      '--color-primary-hover': '#334155',
      '--color-primary-soft': '#e2e8f0',
      '--color-text-main': '#0f172a',
      '--color-text-sub': '#64748b',
      '--color-border': 'rgba(71,85,105,0.14)',
      '--shadow': '0 24px 70px rgba(51,65,85,0.12)',
      '--shadow-card': '0 12px 42px rgba(51,65,85,0.07)',
      '--bg-gradient': 'radial-gradient(circle at top left,rgba(203,213,225,0.3),transparent 28%),radial-gradient(circle at bottom right,rgba(71,85,105,0.1),transparent 26%),linear-gradient(180deg,#f9fafb 0%,#f1f5f9 52%,#e8edf4 100%)',
      '--footer-bg': '#0f172a',
    },
  },
}

const STORAGE_KEY = (username: string) => `site-theme-${username}`

export function loadTheme(username: string): ThemeKey {
  if (typeof window === 'undefined') return 'black'
  const key = STORAGE_KEY(username)
  if (!localStorage.getItem(key)) {
    const oldValue = localStorage.getItem(`site-theme-${username}`)
    if (oldValue) {
      localStorage.setItem(key, oldValue)
      localStorage.removeItem(`site-theme-${username}`)
    }
  }
  return (localStorage.getItem(key) as ThemeKey) ?? 'black'
}

export function saveTheme(username: string, key: ThemeKey): void {
  localStorage.setItem(STORAGE_KEY(username), key)
}

export function applyTheme(key: ThemeKey): void {
  const theme = THEMES[key]
  const root = document.documentElement
  for (const [prop, val] of Object.entries(theme.vars)) {
    if (prop === '--bg-gradient') {
      root.style.setProperty('--bg-gradient', val)
      document.body.style.background = val
    } else if (prop === '--footer-bg') {
      root.style.setProperty('--footer-bg', val)
    } else {
      root.style.setProperty(prop, val)
    }
  }
}
