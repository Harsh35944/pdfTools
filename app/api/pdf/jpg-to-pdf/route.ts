import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  fit: [0, 0], // use image dimensions
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const pageSize = (formData.get('pageSize') as string) || 'fit'
    const orientation = (formData.get('orientation') as string) || 'auto' // portrait / landscape / auto
    const marginPt = parseFloat(formData.get('margin') as string) || 0

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Image files required' }, { status: 400 })
    }

    const pdf = await PDFDocument.create()

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const mime = file.type

      // Convert non-JPEG/PNG to JPEG via sharp
      let imgBuffer: Uint8Array
      let embedMime: string

      if (mime === 'image/jpeg' || mime === 'image/jpg') {
        imgBuffer = new Uint8Array(arrayBuffer); embedMime = 'image/jpeg'
      } else if (mime === 'image/png') {
        imgBuffer = new Uint8Array(arrayBuffer); embedMime = 'image/png'
      } else {
        // Convert to JPEG via sharp
        const converted = await sharp(Buffer.from(arrayBuffer)).jpeg({ quality: 90 }).toBuffer()
        imgBuffer = converted; embedMime = 'image/jpeg'
      }

      const image = embedMime === 'image/jpeg'
        ? await pdf.embedJpg(imgBuffer)
        : await pdf.embedPng(imgBuffer)

      let [pw, ph] = PAGE_SIZES[pageSize] || [0, 0]
      if (!pw || !ph) { pw = image.width; ph = image.height }

      // Orientation handling
      let finalW = pw, finalH = ph
      if (orientation === 'landscape' && pw < ph) { finalW = ph; finalH = pw }
      else if (orientation === 'portrait' && pw > ph) { finalW = ph; finalH = pw }
      else if (orientation === 'auto' && image.width > image.height && pw < ph) { finalW = ph; finalH = pw }

      const page = pdf.addPage([finalW, finalH])
      const drawW = finalW - marginPt * 2
      const drawH = finalH - marginPt * 2
      const scale = Math.min(drawW / image.width, drawH / image.height)
      const dw = image.width * scale
      const dh = image.height * scale

      page.drawImage(image, {
        x: marginPt + (drawW - dw) / 2,
        y: marginPt + (drawH - dh) / 2,
        width: dw,
        height: dh,
      })
    }

    const pdfBytes = await pdf.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="images.pdf"',
      },
    })
  } catch (error) {
    console.error('JPG to PDF error:', error)
    return NextResponse.json({ error: 'Failed to convert images to PDF' }, { status: 500 })
  }
}
