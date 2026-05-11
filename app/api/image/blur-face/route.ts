import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const sigma = parseFloat(formData.get('sigma') as string) || 20

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(buffer).metadata()
    const { width = 800, height = 600 } = meta

    // Get face region from formData (x, y, w, h as % of image)
    const fx = parseFloat(formData.get('fx') as string) || 0
    const fy = parseFloat(formData.get('fy') as string) || 0
    const fw = parseFloat(formData.get('fw') as string) || 100
    const fh = parseFloat(formData.get('fh') as string) || 100

    const left = Math.round((fx / 100) * width)
    const top = Math.round((fy / 100) * height)
    const regionW = Math.round((fw / 100) * width)
    const regionH = Math.round((fh / 100) * height)

    // Extract region, blur, composite back
    const blurredRegion = await sharp(buffer)
      .extract({ left, top, width: regionW, height: regionH })
      .blur(sigma)
      .toBuffer()

    const result = await sharp(buffer)
      .composite([{ input: blurredRegion, left, top }])
      .jpeg({ quality: 90 })
      .toBuffer()

     return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="blurred_${file.name}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to blur face' }, { status: 500 })
  }
}
