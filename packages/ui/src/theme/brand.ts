export const brand = {
  colors: {
    primary: '#0ea5e9',
    primaryDark: '#0284c7',
    entelekronBlue: '#1e40af',
    cyan: '#06b6d4',
    violet: '#7c3aed',
    silver: '#f8fafc',
    white: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2',
  },
  gradients: {
    hero: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 35%, #f5f3ff 100%)',
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #7c3aed 100%)',
    card: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
    energy: 'linear-gradient(90deg, rgba(14,165,233,0.08) 0%, rgba(124,58,237,0.08) 100%)',
  },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
    md: '0 4px 16px rgba(15, 23, 42, 0.08)',
    lg: '0 12px 40px rgba(14, 165, 233, 0.12)',
    glow: '0 0 24px rgba(14, 165, 233, 0.25)',
  },
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    full: '9999px',
  },
  typography: {
    hero: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight',
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-xl font-semibold',
    body: 'text-base text-slate-600',
    caption: 'text-sm text-slate-500',
  },
} as const;

export const statusColors = {
  verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  connecting: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  internal: 'bg-slate-100 text-slate-600 border-slate-200',
} as const;
