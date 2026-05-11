import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('images') as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'At least one image required' }, { status: 400 })
    }

    const pdfDoc = await PDFDocument.create()

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())

      // Enhance: grayscale, normalise, sharpen for scan-like quality
      const enhanced = await sharp(buffer)
        .grayscale()
        .normalise()
        .sharpen()
        .jpeg({ quality: 90 })
        .toBuffer()

      // Get image dimensions
      const meta = await sharp(enhanced).metadata()
      const w = meta.width || 595
      const h = meta.height || 842

      const jpgImage = await pdfDoc.embedJpg(enhanced)
      const page = pdfDoc.addPage([w, h])
      page.drawImage(jpgImage, { x: 0, y: 0, width: w, height: h })
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="scanned.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Scan to PDF error:', error)
    return NextResponse.json({ error: 'Failed to create PDF from scans' }, { status: 500 })
  }
}

