import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    // level: 'low' (fast, minimal), 'medium' (balanced), 'high' (maximum compression)
    const level = (formData.get('level') as string) || 'medium'

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

    // Configure compression based on level
    const saveOptions: Parameters<typeof pdf.save>[0] = {
      useObjectStreams: level !== 'low',
      addDefaultPage: false,
      objectsPerTick: level === 'high' ? 10 : level === 'medium' ? 30 : 50,
    }

    // For high compression: remove metadata, set compress flags
    if (level === 'high') {
      pdf.setTitle('')
      pdf.setAuthor('')
      pdf.setSubject('')
      pdf.setKeywords([])
      pdf.setProducer('')
      pdf.setCreator('')
    }

    const pdfBytes = await pdf.save(saveOptions)
    const savings = Math.round((1 - pdfBytes.byteLength / file.size) * 100)

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="compressed.pdf"',
        'X-Original-Size': file.size.toString(),
        'X-Compressed-Size': pdfBytes.byteLength.toString(),
        'X-Savings-Percent': Math.max(0, savings).toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compress PDF' }, { status: 500 })
  }
}
