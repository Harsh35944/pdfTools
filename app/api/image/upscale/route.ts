import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const scale = parseFloat(formData.get('scale') as string) || 2

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(buffer).metadata()
    const newW = Math.round((meta.width || 800) * Math.min(scale, 4))
    const newH = Math.round((meta.height || 600) * Math.min(scale, 4))

    const upscaled = await sharp(buffer)
      .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: 95 })
      .toBuffer()

    return new NextResponse(Buffer.from(upscaled), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="upscaled_${file.name}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upscale image' }, { status: 500 })
  }
}
