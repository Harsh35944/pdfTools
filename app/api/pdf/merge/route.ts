import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length < 2) {
      return NextResponse.json({ error: 'At least 2 PDF files required' }, { status: 400 })
    }

    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach((page) => mergedPdf.addPage(page))
    }

    const mergedBytes = await mergedPdf.save()

    return new NextResponse(Buffer.from(mergedBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      },
    })
  } catch (error) {
    console.error('Merge PDF error:', error)
    return NextResponse.json({ error: 'Failed to merge PDFs' }, { status: 500 })
  }
}
