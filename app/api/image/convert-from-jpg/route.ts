import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const format = (formData.get('format') as string) || 'png'

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let converted: Buffer
    let mimeType: string
    let ext: string

    switch (format) {
      case 'png':
        converted = await sharp(buffer).png({ compressionLevel: 8 }).toBuffer()
        mimeType = 'image/png'; ext = 'png'; break
      case 'webp':
        converted = await sharp(buffer).webp({ quality: 85 }).toBuffer()
        mimeType = 'image/webp'; ext = 'webp'; break
      case 'gif':
        converted = await sharp(buffer).gif().toBuffer()
        mimeType = 'image/gif'; ext = 'gif'; break
      case 'tiff':
        converted = await sharp(buffer).tiff({ quality: 90 }).toBuffer()
        mimeType = 'image/tiff'; ext = 'tiff'; break
      case 'avif':
        converted = await sharp(buffer).avif({ quality: 80 }).toBuffer()
        mimeType = 'image/avif'; ext = 'avif'; break
      default:
        converted = await sharp(buffer).jpeg({ quality: 90 }).toBuffer()
        mimeType = 'image/jpeg'; ext = 'jpg'
    }

    const baseName = file.name.replace(/\.[^.]+$/, '')

    return new NextResponse(Buffer.from(converted), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${baseName}.${ext}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to convert image' }, { status: 500 })
  }
}