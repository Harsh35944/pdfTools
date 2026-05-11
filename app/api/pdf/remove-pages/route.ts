import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const pagesToRemove = (formData.get('pages') as string) || ''

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const srcPdf = await PDFDocument.load(arrayBuffer)
    const totalPages = srcPdf.getPageCount()

    // Parse pages to remove
    const removeSet = new Set<number>()
    const parts = pagesToRemove.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number)
        for (let i = start; i <= Math.min(end, totalPages); i++) removeSet.add(i - 1)
      } else {
        const p = parseInt(trimmed)
        if (p >= 1 && p <= totalPages) removeSet.add(p - 1)
      }
    }

    // Keep pages not in removeSet
    const keepIndices = srcPdf.getPageIndices().filter(i => !removeSet.has(i))
    if (keepIndices.length === 0) return NextResponse.json({ error: 'Cannot remove all pages' }, { status: 400 })

    const newPdf = await PDFDocument.create()
    const pages = await newPdf.copyPages(srcPdf, keepIndices)
    pages.forEach(p => newPdf.addPage(p))

    const pdfBytes = await newPdf.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="removed-pages.pdf"' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove pages' }, { status: 500 })
  }
}

