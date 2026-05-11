import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { spawn } from 'child_process'
import { createWorker } from 'tesseract.js'
import path from 'path'
import sharp from 'sharp'

const RENDERER = path.join(process.cwd(), 'scripts', 'pdf-render.js')

function renderPage(pdfBuffer: Buffer, page: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RENDERER, String(page)], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
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
    const lang = (formData.get('lang') as string) || 'eng'
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const srcPdf = await PDFDocument.load(buffer)
    const pageCount = srcPdf.getPageCount()

    const worker = await createWorker(lang)

    const newPdf = await PDFDocument.create()
    const font = await newPdf.embedFont(StandardFonts.Helvetica)

    for (let i = 1; i <= pageCount; i++) {
      // Render page to image
      const jpgBuffer = await renderPage(buffer, i)

      // Get rendered image dimensions for coordinate mapping
      const imgMeta = await sharp(jpgBuffer).metadata()
      const imgW = imgMeta.width || 1
      const imgH = imgMeta.height || 1

      // OCR with word-level data
      const { data }: any = await worker.recognize(jpgBuffer)

      // Get original page size (in PDF points)
      const srcPage = srcPdf.getPage(i - 1)
      const { width: pdfW, height: pdfH } = srcPage.getSize()

      // Scale factors: image pixels → PDF points
      const scaleX = pdfW / imgW
      const scaleY = pdfH / imgH

      // Copy original page visually (preserves images, layout)
      const [copiedPage] = await newPdf.copyPages(srcPdf, [i - 1])
      newPdf.addPage(copiedPage)
      const newPage = newPdf.getPage(newPdf.getPageCount() - 1)

      // Overlay WORD-LEVEL invisible text at correct positions
      for (const word of data.words) {
        if (!word.text.trim() || word.confidence < 30) continue

        const { x0, y0, x1, y1 } = word.bbox
        const wordW = (x1 - x0) * scaleX
        const wordH = (y1 - y0) * scaleY

        // PDF origin is bottom-left; image origin is top-left
        const pdfX = x0 * scaleX
        const pdfY = pdfH - y1 * scaleY  // flip Y axis

        // Fit font size to word bounding box height
        const fontSize = Math.max(4, Math.min(wordH * 0.85, 72))

        try {
          newPage.drawText(word.text, {
            x: pdfX,
            y: pdfY,
            size: fontSize,
            font,
            color: rgb(1, 1, 1), // invisible white
            opacity: 0.01,        // nearly invisible
          })
        } catch {
          // Skip words with characters unsupported by Helvetica
        }
      }
    }

    await worker.terminate()

    const pdfBytes = await newPdf.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ocr.pdf"',
      },
    })
  } catch (error: any) {
    console.error('OCR PDF error:', error)
    return NextResponse.json({ error: 'Failed to OCR PDF: ' + error.message }, { status: 500 })
  }
}
