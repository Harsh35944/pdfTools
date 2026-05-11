import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const password = (formData.get('password') as string) || ''

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()

    let pdf: PDFDocument
    try {
      pdf = await PDFDocument.load(arrayBuffer, { password })
    } catch (e) {
      return NextResponse.json({ error: 'Incorrect password or PDF is not encrypted' }, { status: 400 })
    }

    // Save without encryption
    const pdfBytes = await pdf.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="unlocked.pdf"' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unlock PDF' }, { status: 500 })
  }
}

