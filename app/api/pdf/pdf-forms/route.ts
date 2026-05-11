import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFForm, rgb, StandardFonts } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fieldsRaw = formData.get('fields') as string // JSON: { fieldName: value }

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const form = pdfDoc.getForm()

    if (fieldsRaw) {
      const fields: Record<string, string> = JSON.parse(fieldsRaw)
      for (const [name, value] of Object.entries(fields)) {
        try {
          const field = form.getTextField(name)
          field.setText(value)
        } catch {
          try {
            const cb = form.getCheckBox(name)
            if (value === 'true' || value === '1') cb.check()
            else cb.uncheck()
          } catch { /* field not found */ }
        }
      }
      form.flatten()
    }

    // If no fields sent, return info about form fields
    if (!fieldsRaw) {
      const fieldNames = form.getFields().map((f) => ({
        name: f.getName(),
        type: f.constructor.name.replace('PDF', ''),
      }))
      return NextResponse.json({ fields: fieldNames })
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="filled-form.pdf"',
      },
    })
  } catch (error: any) {
    console.error('PDF Forms error:', error)
    return NextResponse.json({ error: 'Failed to process PDF form' }, { status: 500 })
  }
}
