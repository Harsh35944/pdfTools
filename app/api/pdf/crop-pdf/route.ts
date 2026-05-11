import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    // mode: 'box' (exact x,y,w,h) | 'margin' (trim margins in pt from each side)
    const mode = (formData.get('mode') as string) || 'margin'

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()

    if (mode === 'margin') {
      const top    = parseFloat(formData.get('top')    as string) || 0
      const right  = parseFloat(formData.get('right')  as string) || 0
      const bottom = parseFloat(formData.get('bottom') as string) || 0
      const left   = parseFloat(formData.get('left')   as string) || 0

      for (const page of pages) {
        const { width, height } = page.getSize()
        const newX  = left
        const newY  = bottom
        const newW  = Math.max(1, width - left - right)
        const newH  = Math.max(1, height - top - bottom)
        page.setCropBox(newX, newY, newW, newH)
        page.setMediaBox(newX, newY, newW, newH)
      }
    } else {
      // box mode: exact coordinates
      const x     = parseFloat(formData.get('x')      as string) || 0
      const y     = parseFloat(formData.get('y')      as string) || 0
      const cropW = parseFloat(formData.get('width')  as string) || 0
      const cropH = parseFloat(formData.get('height') as string) || 0

      for (const page of pages) {
        const { width, height } = page.getSize()
        const finalW = cropW > 0 ? Math.min(cropW, width - x) : width - x
        const finalH = cropH > 0 ? Math.min(cropH, height - y) : height - y
        const pdfY   = height - y - finalH
        page.setCropBox(x, pdfY, finalW, finalH)
        page.setMediaBox(x, pdfY, finalW, finalH)
      }
    }

    const pdfBytes = await pdfDoc.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cropped.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Crop PDF error:', error)
    return NextResponse.json({ error: 'Failed to crop PDF' }, { status: 500 })
  }
}
