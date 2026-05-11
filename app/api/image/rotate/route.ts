import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const angleRaw = parseInt(formData.get('angle') as string) || 90
    // Normalize angle so 360 doesn't become a noop (use 0 explicitly)
    const angle = ((angleRaw % 360) + 360) % 360

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })
    if (angle === 0) {
      // 0 or 360 â€” return original
      const buf = Buffer.from(await file.arrayBuffer())
      return new NextResponse(Buffer.from(buf), {
        headers: { 'Content-Type': file.type, 'Content-Disposition': `attachment; filename="rotated_${file.name}"` },
      })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Sharp rotate: positive = counter-clockwise. background white for JPEG, transparent for PNG
    const isPng = file.type === 'image/png'
    const rotated = await sharp(buffer)
      .rotate(angle, { background: isPng ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer()

    return new NextResponse(Buffer.from(rotated), {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="rotated_${file.name}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rotate image' }, { status: 500 })
  }
}

