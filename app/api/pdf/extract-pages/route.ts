import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const pages = (formData.get('pages') as string) || ''

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })
    if (!pages) return NextResponse.json({ error: 'Pages required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const srcPdf = await PDFDocument.load(arrayBuffer)
    const totalPages = srcPdf.getPageCount()

    const extractIndices: number[] = []
    const parts = pages.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        for (let i = start; i <= Math.min(end, totalPages); i++) extractIndices.push(i - 1)
      } else {
        const p = parseInt(trimmed)
        if (p >= 1 && p <= totalPages) extractIndices.push(p - 1)
      }
    }

    const newPdf = await PDFDocument.create()
    const copied = await newPdf.copyPages(srcPdf, extractIndices)
    copied.forEach(p => newPdf.addPage(p))

    const pdfBytes = await newPdf.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="extracted.pdf"' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to extract pages' }, { status: 500 })
  }
}
