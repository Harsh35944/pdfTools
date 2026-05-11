import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

// Position helper: returns {x, y} for the text given page size, text size, and position key
function getWatermarkPos(pos: string, pw: number, ph: number, tw: number, th: number, margin = 30) {
  const cx = (pw - tw) / 2, cy = (ph - th) / 2
  const positions: Record<string, { x: number; y: number }> = {
    'top-left':     { x: margin, y: ph - margin - th },
    'top-center':   { x: cx, y: ph - margin - th },
    'top-right':    { x: pw - margin - tw, y: ph - margin - th },
    'middle-left':  { x: margin, y: cy },
    'center':       { x: cx, y: cy },
    'middle-right': { x: pw - margin - tw, y: cy },
    'bottom-left':  { x: margin, y: margin },
    'bottom-center':{ x: cx, y: margin },
    'bottom-right': { x: pw - margin - tw, y: margin },
  }
  return positions[pos] ?? positions['center']
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return rgb(r, g, b)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const text = (formData.get('text') as string) || 'CONFIDENTIAL'
    const opacity = parseFloat(formData.get('opacity') as string) || 0.3
    const fontSize = parseInt(formData.get('fontSize') as string) || 48
    const position = (formData.get('position') as string) || 'center'
    const rotation = parseInt(formData.get('rotation') as string) || 45
    const colorHex = (formData.get('color') as string) || '#cc0000'
    const tiled = formData.get('tiled') === 'true'

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const font = await pdf.embedFont(StandardFonts.HelveticaBold)
    const color = hexToRgb(colorHex.startsWith('#') ? colorHex : '#cc0000')

    pdf.getPages().forEach((page) => {
      const { width, height } = page.getSize()
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      const textHeight = fontSize

      if (tiled) {
        // Draw watermark in a grid pattern
        const cols = Math.ceil(width / (textWidth + 80))
        const rows = Math.ceil(height / (textHeight + 80))
        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c <= cols; c++) {
            page.drawText(text, {
              x: c * (textWidth + 80),
              y: r * (textHeight + 80),
              size: fontSize, font, color, opacity,
              rotate: degrees(rotation),
            })
          }
        }
      } else {
        const { x, y } = getWatermarkPos(position, width, height, textWidth, textHeight)
        page.drawText(text, { x, y, size: fontSize, font, color, opacity, rotate: degrees(rotation) })
      }
    })

    const pdfBytes = await pdf.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="watermarked.pdf"' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to watermark PDF' }, { status: 500 })
  }
}

