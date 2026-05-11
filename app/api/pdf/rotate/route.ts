import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, degrees } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    // pageAngles: JSON object { "0": 90, "1": 180, "2": 270 } (0-indexed page â†’ angle)
    // angle: single angle applied to all pages if pageAngles not provided
    const angleRaw = parseInt(formData.get('angle') as string) || 90
    const pageAnglesRaw = formData.get('pageAngles') as string

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pages = pdf.getPages()

    const pageAngles: Record<number, number> = pageAnglesRaw
      ? JSON.parse(pageAnglesRaw)
      : Object.fromEntries(pages.map((_, i) => [i, angleRaw]))

    pages.forEach((page, index) => {
      const angle = pageAngles[index] ?? 0
      if (angle === 0) return
      const currentRotation = page.getRotation().angle
      page.setRotation(degrees(currentRotation + angle))
    })

    const pdfBytes = await pdf.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="rotated.pdf"' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rotate PDF' }, { status: 500 })
  }
}

