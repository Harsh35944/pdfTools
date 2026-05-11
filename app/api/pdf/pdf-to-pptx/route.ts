import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { spawn } from 'child_process'
import path from 'path'
import PptxGenJS from 'pptxgenjs'

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
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfDoc = await PDFDocument.load(buffer)
    const pageCount = pdfDoc.getPageCount()

    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'

    for (let i = 1; i <= pageCount; i++) {
      const jpgBuffer = await renderPage(buffer, i)
      const slide = pptx.addSlide()
      slide.addImage({
        data: `image/jpeg;base64,${jpgBuffer.toString('base64')}`,
        x: 0, y: 0, w: '100%', h: '100%',
      })
    }

    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer

    return new NextResponse(Buffer.from(pptxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="converted.pptx"',
      },
    })
  } catch (error: any) {
    console.error('PDF to PPT error:', error)
    return NextResponse.json({ error: 'Failed to convert PDF to PowerPoint' }, { status: 500 })
  }
}
