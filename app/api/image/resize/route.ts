import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const mode = (formData.get('mode') as string) || 'pixels' // 'pixels' | 'percent'
    const widthRaw = formData.get('width') as string
    const heightRaw = formData.get('height') as string
    const percent = parseFloat(formData.get('percent') as string) || 100
    const fit = (formData.get('fit') as string) || 'inside'
    const upscale = formData.get('upscale') !== 'false' // default true

    if (!file) return NextResponse.json({ error: 'Image file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(buffer).metadata()
    const origW = meta.width || 800
    const origH = meta.height || 600

    let width: number | undefined
    let height: number | undefined

    if (mode === 'percent') {
      width = Math.round(origW * percent / 100)
      height = Math.round(origH * percent / 100)
    } else {
      width = widthRaw ? parseInt(widthRaw) : undefined
      height = heightRaw ? parseInt(heightRaw) : undefined
    }

    if (!width && !height) return NextResponse.json({ error: 'Width, height, or percent required' }, { status: 400 })

    // If not upscaling, cap at original dimensions
    if (!upscale) {
      if (width && width > origW) width = origW
      if (height && height > origH) height = origH
    }

    // Preserve original format
    const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg'
    const isPng = file.type === 'image/png'
    const isWebp = file.type === 'image/webp'

    let resized = sharp(buffer).resize(width, height, { fit: fit as any, withoutEnlargement: !upscale })

    let outBuffer: Buffer
    let contentType: string
    if (isPng) { outBuffer = await resized.png().toBuffer(); contentType = 'image/png' }
    else if (isWebp) { outBuffer = await resized.webp({ quality: 85 }).toBuffer(); contentType = 'image/webp' }
    else { outBuffer = await resized.jpeg({ quality: 90 }).toBuffer(); contentType = 'image/jpeg' }

    return new NextResponse(Buffer.from(outBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="resized_${file.name}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resize image' }, { status: 500 })
  }
}
