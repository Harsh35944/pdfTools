import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file1 = formData.get('file1') as File
    const file2 = formData.get('file2') as File
    if (!file1 || !file2) return NextResponse.json({ error: 'Two PDF files required' }, { status: 400 })

    const buf1 = Buffer.from(await file1.arrayBuffer())
    const buf2 = Buffer.from(await file2.arrayBuffer())

    const pdf1 = await PDFDocument.load(buf1)
    const pdf2 = await PDFDocument.load(buf2)

    const maxPages = Math.max(pdf1.getPageCount(), pdf2.getPageCount())
    const resultPdf = await PDFDocument.create()
    const font = await resultPdf.embedFont(StandardFonts.HelveticaBold)

    for (let i = 0; i < maxPages; i++) {
      // Create a wide page to show both side by side (A3 landscape)
      const comparePage = resultPdf.addPage([1684, 595])
      const { width, height } = comparePage.getSize()
      const halfW = width / 2

      // Labels
      comparePage.drawRectangle({ x: 0, y: height - 30, width: halfW, height: 30, color: rgb(0.2, 0.4, 0.8) })
      comparePage.drawRectangle({ x: halfW, y: height - 30, width: halfW, height: 30, color: rgb(0.7, 0.2, 0.2) })
      comparePage.drawText(`File 1: ${file1.name} — Page ${i + 1}`, { x: 10, y: height - 20, size: 11, font, color: rgb(1, 1, 1) })
      comparePage.drawText(`File 2: ${file2.name} — Page ${i + 1}`, { x: halfW + 10, y: height - 20, size: 11, font, color: rgb(1, 1, 1) })

      // Divider
      comparePage.drawLine({ start: { x: halfW, y: 0 }, end: { x: halfW, y: height }, thickness: 2, color: rgb(0.5, 0.5, 0.5) })

      // Embed page from pdf1 if exists
      if (i < pdf1.getPageCount()) {
        const [embeddedPage] = await resultPdf.embedPages([pdf1.getPage(i)])
        const { width: pw, height: ph } = pdf1.getPage(i).getSize()
        const scale = Math.min((halfW - 20) / pw, (height - 50) / ph)
        comparePage.drawPage(embeddedPage, { x: 10, y: 10, width: pw * scale, height: ph * scale })
      } else {
        comparePage.drawText('(No page)', { x: halfW / 2 - 30, y: height / 2, size: 14, font, color: rgb(0.6, 0.6, 0.6) })
      }

      // Embed page from pdf2 if exists
      if (i < pdf2.getPageCount()) {
        const [embeddedPage] = await resultPdf.embedPages([pdf2.getPage(i)])
        const { width: pw, height: ph } = pdf2.getPage(i).getSize()
        const scale = Math.min((halfW - 20) / pw, (height - 50) / ph)
        comparePage.drawPage(embeddedPage, { x: halfW + 10, y: 10, width: pw * scale, height: ph * scale })
      } else {
        comparePage.drawText('(No page)', { x: halfW + halfW / 2 - 30, y: height / 2, size: 14, font, color: rgb(0.6, 0.6, 0.6) })
      }
    }

    const pdfBytes = await resultPdf.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="comparison.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Compare PDF error:', error)
    return NextResponse.json({ error: 'Failed to compare PDFs' }, { status: 500 })
  }
}
