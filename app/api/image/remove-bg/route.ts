import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const TOLERANCE = 60 // color distance threshold for background detection

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const tolerance = parseInt(formData.get('tolerance') as string) || TOLERANCE

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width, height, channels } = info // channels = 4 (RGBA)
    const pixels = new Uint8Array(data)

    // Sample background color from the 4 corners
    const corners = [
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    ]
    let bgR = 0, bgG = 0, bgB = 0
    for (const [cx, cy] of corners) {
      const idx = (cy * width + cx) * 4
      bgR += pixels[idx]; bgG += pixels[idx + 1]; bgB += pixels[idx + 2]
    }
    bgR = Math.round(bgR / 4); bgG = Math.round(bgG / 4); bgB = Math.round(bgB / 4)

    // Replace background-colored pixels with transparency
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2]
      if (colorDistance(r, g, b, bgR, bgG, bgB) < tolerance) {
        pixels[idx + 3] = 0 // transparent
      }
    }

    const result = await sharp(Buffer.from(pixels), {
      raw: { width, height, channels: 4 },
    }).png().toBuffer()

    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="no_bg_${file.name.replace(/\.[^.]+$/, '')}.png"`,
      },
    })
  } catch (error: any) {
    console.error('Remove BG error:', error)
    return NextResponse.json({ error: 'Failed to remove background' }, { status: 500 })
  }
}
