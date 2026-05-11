import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import archiver from 'archiver'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    const images: { name: string; buf: Buffer; ext: string }[] = []
    let imgIdx = 0

    const context = pdfDoc.context
    const refs = context.enumerateIndirectObjects()

    for (const [, obj] of refs) {
      try {
        const objStr = obj.toString()
        if (objStr.includes('/Subtype /Image') || objStr.includes('/Subtype/Image')) {
          const bytes = (obj as any).contents as Uint8Array
          if (bytes && bytes.length > 100) {
            const buf = Buffer.from(bytes)
            // Detect format by magic bytes
            let ext = 'jpg'
            if (buf[0] === 0x89 && buf[1] === 0x50) ext = 'png'
            else if (buf[0] === 0x47 && buf[1] === 0x49) ext = 'gif'
            images.push({ name: `image_${String(++imgIdx).padStart(3, '0')}.${ext}`, buf, ext })
          }
        }
      } catch {}
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'No embedded images found in this PDF' }, { status: 404 })
    }

    // Build ZIP
    const archive = archiver('zip', { zlib: { level: 6 } })
    const chunks: Buffer[] = []
    archive.on('data', (d: Buffer) => chunks.push(d))

    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
      images.forEach(({ name, buf }) => archive.append(buf, { name }))
      archive.finalize()
    })

    const zipBuffer = Buffer.concat(chunks)
    return new NextResponse(Buffer.from(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="extracted_images.zip"',
        'X-Image-Count': images.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Extract images error:', error)
    return NextResponse.json({ error: 'Failed to extract images' }, { status: 500 })
  }
}
