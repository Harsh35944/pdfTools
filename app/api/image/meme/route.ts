import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const topText = (formData.get('topText') as string) || ''
    const bottomText = (formData.get('bottomText') as string) || ''
    const fontSize = parseInt(formData.get('fontSize') as string) || 48

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(buffer).metadata()
    const w = meta.width || 800
    const h = meta.height || 600

    // Build SVG text overlays (white text with black stroke = classic meme style)
    const makeText = (text: string, y: number) => `
      <text x="${w / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle"
        font-family="Impact, Arial Black, sans-serif" font-size="${fontSize}" font-weight="bold"
        fill="white" stroke="black" stroke-width="${Math.max(2, fontSize * 0.08)}"
        paint-order="stroke fill" letter-spacing="2">
        ${text.toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>`

    const svgOverlay = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${topText ? makeText(topText, fontSize * 0.7) : ''}
      ${bottomText ? makeText(bottomText, h - fontSize * 0.7) : ''}
    </svg>`

    const result = await sharp(buffer)
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .jpeg({ quality: 92 })
      .toBuffer()

    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="meme.jpg"',
      },
    })
  } catch (error: any) {
    console.error('Meme generator error:', error)
    return NextResponse.json({ error: 'Failed to create meme' }, { status: 500 })
  }
}
