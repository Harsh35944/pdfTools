import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const signatureText = (formData.get('signature') as string) || 'Signed'
    const positionX = parseFloat(formData.get('x') as string) || 50
    const positionY = parseFloat(formData.get('y') as string) || 50

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const font = await pdf.embedFont(StandardFonts.HelveticaBoldOblique)
    const pages = pdf.getPages()
    const lastPage = pages[pages.length - 1]
    const { width, height } = lastPage.getSize()

    lastPage.drawText(signatureText, {
      x: (positionX / 100) * width,
      y: (positionY / 100) * height,
      size: 28,
      font,
      color: rgb(0.05, 0.1, 0.6),
    })

    // Draw underline
    lastPage.drawLine({
      start: { x: (positionX / 100) * width, y: (positionY / 100) * height - 4 },
      end: { x: (positionX / 100) * width + signatureText.length * 16, y: (positionY / 100) * height - 4 },
      thickness: 1.5,
      color: rgb(0.05, 0.1, 0.6),
    })

    const pdfBytes = await pdf.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="signed.pdf"',
      },
    })
  } catch (error) {
    console.error('Sign PDF error:', error)
    return NextResponse.json({ error: 'Failed to sign PDF' }, { status: 500 })
  }
}

