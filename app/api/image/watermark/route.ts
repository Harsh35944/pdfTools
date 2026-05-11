import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

function getPos(pos: string, iw: number, ih: number, tw: number, th: number, margin = 20) {
  const positions: Record<string, { x: number; y: number }> = {
    'top-left':     { x: margin, y: margin },
    'top-center':   { x: (iw - tw) / 2, y: margin },
    'top-right':    { x: iw - tw - margin, y: margin },
    'middle-left':  { x: margin, y: (ih - th) / 2 },
    'center':       { x: (iw - tw) / 2, y: (ih - th) / 2 },
    'middle-right': { x: iw - tw - margin, y: (ih - th) / 2 },
    'bottom-left':  { x: margin, y: ih - th - margin },
    'bottom-center':{ x: (iw - tw) / 2, y: ih - th - margin },
    'bottom-right': { x: iw - tw - margin, y: ih - th - margin },
  }
  return positions[pos] ?? positions['center']
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '').match(/.{2}/g)!
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const text = (formData.get('text') as string) || 'SAMPLE'
    const position = (formData.get('position') as string) || 'center'
    const opacity = parseFloat(formData.get('opacity') as string) || 0.5
    const fontSize = parseInt(formData.get('fontSize') as string) || 36
    const colorHex = (formData.get('color') as string) || '#ffffff'
    const rotation = parseInt(formData.get('rotation') as string) || 0

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(buffer).metadata()
    const { width: iw = 800, height: ih = 600 } = meta

    // Estimate text size (rough: ~0.6 * fontSize per char width, fontSize height)
    const tw = text.length * fontSize * 0.6
    const th = fontSize
    const { x, y } = getPos(position, iw, ih, tw, th)
    const { r, g, b } = hexToRgb(colorHex.startsWith('#') ? colorHex : '#ffffff')
    const alpha = Math.round(opacity * 255)

    // Create SVG watermark overlay
    const svgText = `
      <svg width="${iw}" height="${ih}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${x + tw / 2}" y="${y + th}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="rgba(${r},${g},${b},${opacity})"
          text-anchor="middle"
          transform="rotate(${rotation}, ${x + tw / 2}, ${y + th / 2})"
        >${text}</text>
      </svg>`

    const result = await sharp(buffer)
      .composite([{ input: Buffer.from(svgText), blend: 'over' }])
      .toBuffer()

    const contentType = file.type.startsWith('image/') ? file.type : 'image/jpeg'
    const ext = contentType.split('/')[1]

    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
      },
    })
  } catch (error: any) {
    console.error('Watermark image error:', error)
    return NextResponse.json({ error: 'Failed to watermark image' }, { status: 500 })
  }
}

