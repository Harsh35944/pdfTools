import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()

    // pdf-lib re-load with ignoreEncryption + re-save fixes most corruption
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    })

    // Re-embed all pages into a fresh document for maximum recovery
    const newDoc = await PDFDocument.create()
    const pageIndices = pdfDoc.getPageIndices()
    const pages = await newDoc.copyPages(pdfDoc, pageIndices)
    pages.forEach((p) => newDoc.addPage(p))

    const pdfBytes = await newDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="repaired.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Repair PDF error:', error)
    return NextResponse.json({ error: 'Failed to repair PDF' }, { status: 500 })
  }
}

