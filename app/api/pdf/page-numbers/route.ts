import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// 6 positions
function getPos(pos: string, pw: number, ph: number, tw: number, fontSize: number, margin: number) {
  const positions: Record<string, { x: number; y: number }> = {
    'bottom-left':   { x: margin, y: margin },
    'bottom-center': { x: (pw - tw) / 2, y: margin },
    'bottom-right':  { x: pw - tw - margin, y: margin },
    'top-left':      { x: margin, y: ph - margin - fontSize },
    'top-center':    { x: (pw - tw) / 2, y: ph - margin - fontSize },
    'top-right':     { x: pw - tw - margin, y: ph - margin - fontSize },
  }
  return positions[pos] ?? positions['bottom-center']
}

function parseRange(rangeStr: string, total: number): number[] {
  if (!rangeStr.trim() || rangeStr.trim() === 'all') return Array.from({ length: total }, (_, i) => i)
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const position = (formData.get('position') as string) || 'bottom-center'
    const startFrom = parseInt(formData.get('startFrom') as string) || 1
    const format = (formData.get('format') as string) || '{n}'
    const fontSize = parseInt(formData.get('fontSize') as string) || 11
    const margin = parseInt(formData.get('margin') as string) || 20
    const pageRange = (formData.get('pageRange') as string) || 'all'

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const pages = pdf.getPages()
    const total = pages.length
    const targetIndices = parseRange(pageRange, total)

    pages.forEach((page, index) => {
      if (!targetIndices.includes(index)) return
      const { width, height } = page.getSize()
      const pageNum = index + startFrom
      const text = format.replace('{n}', pageNum.toString()).replace('{total}', total.toString())
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      const { x, y } = getPos(position, width, height, textWidth, fontSize, margin)
      page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) })
    })

    const pdfBytes = await pdf.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="numbered.pdf"' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add page numbers' }, { status: 500 })
  }
}
