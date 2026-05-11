import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const format = (formData.get('format') as string) || 'jpeg' // jpeg, png, webp, gif, avif

    if (!file) {
      return NextResponse.json({ error: 'Image file required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      avif: 'image/avif',
    }

    const converted = await sharp(buffer)
      .toFormat(format as any)
      .toBuffer()

    const outputMime = mimeMap[format] || 'image/jpeg'
    const baseName = file.name.replace(/\.[^.]+$/, '')

    return new NextResponse(Buffer.from(converted), {
      headers: {
        'Content-Type': outputMime,
        'Content-Disposition': `attachment; filename="${baseName}.${format}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to convert image' }, { status: 500 })
  }
}
