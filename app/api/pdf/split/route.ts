import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import archiver from 'archiver'
import { Readable } from 'stream'

function parseRange(rangeStr: string, total: number): number[] {
  if (!rangeStr.trim()) return []
  const indices: number[] = []
  for (const part of rangeStr.split(',')) {
    const t = part.trim()
    if (t.includes('-')) {
      const [s, e] = t.split('-').map(Number)
      for (let i = s; i <= Math.min(e, total); i++) if (i >= 1) indices.push(i - 1)
    } else {
      const n = parseInt(t)
      if (n >= 1 && n <= total) indices.push(n - 1)
    }
  }
  return [...new Set(indices)].sort((a, b) => a - b)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const mode = (formData.get('mode') as string) || 'range' // 'range' | 'each'
    const pageRange = (formData.get('pageRange') as string) || ''

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const srcPdf = await PDFDocument.load(arrayBuffer)
    const totalPages = srcPdf.getPageCount()

    if (mode === 'each') {
      // Split every page into a separate PDF and zip them
      const chunks: { name: string; buf: Buffer }[] = []
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create()
        const [page] = await newPdf.copyPages(srcPdf, [i])
        newPdf.addPage(page)
        const bytes = await newPdf.save()
        chunks.push({ name: `page_${i + 1}.pdf`, buf: Buffer.from(bytes) })
      }

      // Create ZIP
      const archive = archiver('zip', { zlib: { level: 6 } })
      const bufs: Buffer[] = []
      archive.on('data', (d: Buffer) => bufs.push(d))

      await new Promise<void>((resolve, reject) => {
        archive.on('end', resolve)
        archive.on('error', reject)
        chunks.forEach(({ name, buf }) => archive.append(buf, { name }))
        archive.finalize()
      })

      const zipBuffer = Buffer.concat(bufs)
      return new NextResponse(Buffer.from(zipBuffer), {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="split_pages.zip"',
        },
      })
    } else {
      // Range mode: extract specified pages into one PDF
      let indices = parseRange(pageRange, totalPages)
      if (!indices.length) indices = srcPdf.getPageIndices()

      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(srcPdf, indices)
      pages.forEach((p) => newPdf.addPage(p))

      const pdfBytes = await newPdf.save()
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="split.pdf"' },
      })
    }
  } catch (error) {
    console.error('Split PDF error:', error)
    return NextResponse.json({ error: 'Failed to split PDF' }, { status: 500 })
  }
}

