import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import archiver from 'archiver'
import { spawn } from 'child_process'
import path from 'path'

const RENDERER = path.join(process.cwd(), 'scripts', 'pdf-render.js')

function renderPage(pdfBuffer: Buffer, page: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RENDERER, String(page)], { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', (c: Buffer) => out.push(c))
    child.stderr.on('data', (c: Buffer) => err.push(c))
    child.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(out))
      else reject(new Error(Buffer.concat(err).toString() || `Exit ${code}`))
    })
    child.on('error', reject)
    child.stdin.write(pdfBuffer)
    child.stdin.end()
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const quality = parseInt(formData.get('quality') as string) || 90
    // mode: 'single' (first page only, back-compat) | 'zip' (all pages as ZIP)
    const mode = (formData.get('mode') as string) || 'zip'

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const srcPdf = await PDFDocument.load(buffer)
    const pageCount = srcPdf.getPageCount()

    if (mode === 'single') {
      const jpgBuffer = await renderPage(buffer, 1)
      return new NextResponse(Buffer.from(jpgBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': 'attachment; filename="page_1.jpg"',
        },
      })
    }

    // ZIP all pages
    const archive = archiver('zip', { zlib: { level: 6 } })
    const chunks: Buffer[] = []
    archive.on('data', (d: Buffer) => chunks.push(d))

    const renderPromises = Array.from({ length: pageCount }, (_, i) =>
      renderPage(buffer, i + 1).then((jpg) => ({ page: i + 1, jpg }))
    )

    // Render sequentially to avoid memory spikes
    const results: { page: number; jpg: Buffer }[] = []
    for (let i = 1; i <= pageCount; i++) {
      const jpg = await renderPage(buffer, i)
      results.push({ page: i, jpg })
    }

    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
      results.forEach(({ page, jpg }) =>
        archive.append(jpg, { name: `page_${String(page).padStart(3, '0')}.jpg` })
      )
      archive.finalize()
    })

    const zipBuffer = Buffer.concat(chunks)
    return new NextResponse(Buffer.from(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="pdf_pages.zip"',
        'X-Page-Count': pageCount.toString(),
      },
    })
  } catch (error: any) {
    console.error('PDF to JPG error:', error)
    return NextResponse.json({ error: 'Failed to convert PDF to JPG' }, { status: 500 })
  }
}
