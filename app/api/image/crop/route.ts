import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const left = parseInt(formData.get('left') as string) || 0
    const top = parseInt(formData.get('top') as string) || 0
    const width = parseInt(formData.get('width') as string)
    const height = parseInt(formData.get('height') as string)

    if (!file) {
      return NextResponse.json({ error: 'Image file required' }, { status: 400 })
    }
    if (!width || !height) {
      return NextResponse.json({ error: 'Width and height required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const cropped = await sharp(buffer)
      .extract({ left, top, width, height })
      .toBuffer()

    return new NextResponse(Buffer.from(cropped), {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="cropped_${file.name}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to crop image' }, { status: 500 })
  }
}
