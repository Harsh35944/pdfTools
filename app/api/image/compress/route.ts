import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const quality = parseInt(formData.get('quality') as string) || 80

    if (!file) {
      return NextResponse.json({ error: 'Image file required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = file.type

    let compressed: Buffer
    let outputMime = mimeType
    let filename = file.name

    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      compressed = await sharp(buffer).jpeg({ quality }).toBuffer()
    } else if (mimeType === 'image/png') {
      compressed = await sharp(buffer).png({ quality }).toBuffer()
    } else if (mimeType === 'image/webp') {
      compressed = await sharp(buffer).webp({ quality }).toBuffer()
    } else {
      // Convert to jpeg for other formats
      compressed = await sharp(buffer).jpeg({ quality }).toBuffer()
      outputMime = 'image/jpeg'
      filename = filename.replace(/\.[^.]+$/, '.jpg')
    }

    return new NextResponse(Buffer.from(compressed), {
      headers: {
        'Content-Type': outputMime,
        'Content-Disposition': `attachment; filename="compressed_${filename}"`,
      },
    })
  } catch (error) {
    console.error('Compress image error:', error)
    return NextResponse.json({ error: 'Failed to compress image' }, { status: 500 })
  }
}
