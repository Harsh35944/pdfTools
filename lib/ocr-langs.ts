import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const SUPPORTED_LANGS_50 = [
  'eng','fra','deu','spa','ita','por','rus','chi_sim','chi_tra','jpn','kor',
  'ara','hin','tur','pol','nld','swe','nor','dan','fin','ces','slk','ron',
  'hun','bul','hrv','ukr','vie','tha','ind','msa','heb','ell','lat','cat',
  'lit','lav','est','slv','srp','mkd','ben','tam','tel','mal','kan','guj',
  'mar','pan','urd',
]

function parseRange(rangeStr: string, total: number): number[] {
  if (!rangeStr.trim() || rangeStr === 'all') return Array.from({ length: total }, (_, i) => i)
  const indices: number[] = []
  for (const part of rangeStr.split(',')) {
    const t = part.trim()
    if (t.includes('-')) {
      const [s, e] = t.split('-').map(Number)
      for (let i = s; i <= Math.min(e, total); i++) if (i >= 1) indices.push(i - 1)
    } else {
      const n = parseInt(t)
      if (n >= 1 && n <= total) indices.push(n - 1)
    }
  }
  return [...new Set(indices)].sort((a, b) => a - b)
}

export { SUPPORTED_LANGS_50 }
