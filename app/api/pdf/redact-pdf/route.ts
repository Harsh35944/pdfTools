import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'

interface RedactArea {
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const areasRaw = formData.get('areas') as string
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const areas: RedactArea[] = areasRaw ? JSON.parse(areasRaw) : []
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()

    for (const area of areas) {
      const page = pages[area.pageIndex]
      if (!page) continue
      const { height } = page.getSize()
      // Convert top-left canvas coords to PDF bottom-left coords
      page.drawRectangle({
        x: area.x,
        y: height - area.y - area.height,
        width: area.width,
        height: area.height,
        color: rgb(0, 0, 0), // solid black redaction
        opacity: 1,
      })
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="redacted.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Redact PDF error:', error)
    return NextResponse.json({ error: 'Failed to redact PDF' }, { status: 500 })
  }
}
