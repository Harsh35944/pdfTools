import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

const EXTRACTOR = path.join(process.cwd(), 'scripts', 'pdf-extract-text.js')

function extractText(pdfBuffer: Buffer): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [EXTRACTOR], { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', (c: Buffer) => out.push(c))
    child.stderr.on('data', (c: Buffer) => err.push(c))
    child.on('close', (code) => {
      if (code === 0) { try { resolve(JSON.parse(Buffer.concat(out).toString())) } catch { reject(new Error('Parse error')) } }
      else reject(new Error(Buffer.concat(err).toString()))
    })
    child.on('error', reject)
    child.stdin.write(pdfBuffer)
    child.stdin.end()
  })
}

// MyMemory RFC3066 overrides
const LANG_MAP: Record<string, string> = { zh: 'zh-CN', ms: 'ms-MY', uk: 'uk-UA' }

async function translateChunk(text: string, sourceLang: string, targetLang: string): Promise<{ text: string; fallback: boolean }> {
  if (!text.replace(/[\s•\-–—·]+/g, '').trim()) return { text, fallback: false }
  const chunk = text.slice(0, 4900)
  const src = sourceLang === 'auto' ? 'autodetect' : (LANG_MAP[sourceLang] ?? sourceLang)
  const tgt = LANG_MAP[targetLang] ?? targetLang
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${src}|${tgt}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return { text, fallback: true }
    const data = await res.json()
    if (parseInt(data.responseStatus) !== 200) return { text, fallback: true }
    return { text: data.responseData?.translatedText || text, fallback: false }
  } catch {
    return { text, fallback: true }
  }
}

async function translateText(text: string, sourceLang: string, targetLang: string): Promise<{ text: string; fallback: boolean }> {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 4900) chunks.push(text.slice(i, i + 4900))
  let anyFallback = false
  const parts = await Promise.all(chunks.map(async c => {
    const r = await translateChunk(c, sourceLang, targetLang)
    if (r.fallback) anyFallback = true
    return r.text
  }))
  return { text: parts.join(' '), fallback: anyFallback }
}

// Wrap text to fit within maxWidth using pdf-lib font metrics
function wrapLine(text: string, maxCharsPerLine = 85): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (test.length > maxCharsPerLine && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const targetLang = (formData.get('lang') as string) || 'es'
    const sourceLang = (formData.get('sourceLang') as string) || 'auto'
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const pages = await extractText(buffer)

    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 11
    const lineHeight = 16
    const margin = 50
    const pageWidth = 595
    const pageHeight = 842
    const usableWidth = pageWidth - margin * 2
    const charsPerLine = Math.floor(usableWidth / (fontSize * 0.55)) // ~85 for 11pt Helvetica

    let totalFallbacks = 0
    let totalChunks = 0

    for (const pageLines of pages) {
      const pageText = pageLines.join('\n').trim()
      if (!pageText) continue

      const { text: translated, fallback } = await translateText(pageText, sourceLang, targetLang)
      totalChunks++
      if (fallback) totalFallbacks++

      // Word-wrap all lines properly
      const wrappedLines: string[] = []
      for (const rawLine of translated.split('\n')) {
        wrappedLines.push(...wrapLine(rawLine, charsPerLine))
      }

      let page = pdfDoc.addPage([pageWidth, pageHeight])
      let y = pageHeight - margin

      for (const line of wrappedLines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          y = pageHeight - margin
        }
        if (line.trim()) {
          page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) })
        }
        y -= lineHeight
      }
    }

    const pdfBytes = await pdfDoc.save()
    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="translated_${targetLang}.pdf"`,
    }
    if (totalFallbacks > 0) {
      headers['X-Translation-Warnings'] = `partial:${totalFallbacks}/${totalChunks} pages used original text (API limit or error)`
    }

    return new NextResponse(Buffer.from(pdfBytes), { headers })
  } catch (error: any) {
    console.error('Translate PDF error:', error)
    return NextResponse.json({ error: 'Translation failed: ' + error.message }, { status: 500 })
  }
}
