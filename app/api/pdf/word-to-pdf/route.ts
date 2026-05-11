import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Word file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { value: rawText } = await mammoth.extractRawText({ buffer })

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const fontSize = 12
    const lineHeight = 18
    const margin = 50
    const pageWidth = 595
    const pageHeight = 842
    const usableWidth = pageWidth - margin * 2
    const charsPerLine = Math.floor(usableWidth / (fontSize * 0.55))

    const paragraphs = rawText.split('\n').filter((l) => l.trim() !== '')
    const lines: string[] = []

    for (const para of paragraphs) {
      const words = para.split(' ')
      let currentLine = ''
      for (const word of words) {
        if ((currentLine + ' ' + word).length > charsPerLine) {
          lines.push(currentLine.trim())
          currentLine = word
        } else {
          currentLine += ' ' + word
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim())
      lines.push('') // paragraph gap
    }

    let page = pdfDoc.addPage([pageWidth, pageHeight])
    let y = pageHeight - margin

    for (const line of lines) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
      }
      if (line) {
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) })
      }
      y -= lineHeight
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Word to PDF error:', error)
    return NextResponse.json({ error: 'Failed to convert Word to PDF' }, { status: 500 })
  }
}

