import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

interface Annotation {
  type: 'text' | 'rect' | 'circle'
  pageIndex: number
  x: number
  y: number
  text?: string
  fontSize?: number
  color?: [number, number, number]
  width?: number
  height?: number
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const annotationsRaw = formData.get('annotations') as string

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const annotations: Annotation[] = annotationsRaw ? JSON.parse(annotationsRaw) : []
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const pages = pdfDoc.getPages()

    for (const ann of annotations) {
      const page = pages[ann.pageIndex]
      if (!page) continue
      const { height } = page.getSize()
      const color = ann.color ? rgb(ann.color[0], ann.color[1], ann.color[2]) : rgb(0, 0, 0)
      // Convert from top-left (canvas) to bottom-left (PDF) coordinates
      const pdfY = height - ann.y

      if (ann.type === 'text' && ann.text) {
        page.drawText(ann.text, { x: ann.x, y: pdfY, size: ann.fontSize || 14, font, color })
      } else if (ann.type === 'rect') {
        page.drawRectangle({ x: ann.x, y: pdfY - (ann.height || 50), width: ann.width || 100, height: ann.height || 50, borderColor: color, borderWidth: 2 })
      } else if (ann.type === 'circle') {
        page.drawEllipse({ x: ann.x + (ann.width || 50) / 2, y: pdfY - (ann.height || 50) / 2, xScale: (ann.width || 50) / 2, yScale: (ann.height || 50) / 2, borderColor: color, borderWidth: 2 })
      }
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="edited.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Edit PDF error:', error)
    return NextResponse.json({ error: 'Failed to edit PDF' }, { status: 500 })
  }
}
