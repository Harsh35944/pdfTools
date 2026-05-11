import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Excel file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const wb = XLSX.read(buffer, { type: 'buffer' })

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const pageWidth = 842   // A4 landscape
    const pageHeight = 595
    const margin = 40
    const fontSize = 9
    const cellH = 16
    const maxCols = 10

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName]
      const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][]
      if (!rows.length) continue

      const colCount = Math.min(Math.max(...rows.map((r) => r.length)), maxCols)
      const colWidth = Math.floor((pageWidth - margin * 2) / colCount)

      let page = pdfDoc.addPage([pageWidth, pageHeight])
      let y = pageHeight - margin

      // Sheet title
      page.drawText(`Sheet: ${sheetName}`, { x: margin, y, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.7) })
      y -= 20

      for (const [rowIdx, row] of rows.entries()) {
        if (y < margin + cellH) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          y = pageHeight - margin
        }

        const isHeader = rowIdx === 0
        if (isHeader) {
          page.drawRectangle({ x: margin, y: y - 2, width: pageWidth - margin * 2, height: cellH, color: rgb(0.2, 0.4, 0.8) })
        } else if (rowIdx % 2 === 0) {
          page.drawRectangle({ x: margin, y: y - 2, width: pageWidth - margin * 2, height: cellH, color: rgb(0.95, 0.95, 0.98) })
        }

        for (let c = 0; c < colCount; c++) {
          const cellText = String(row[c] ?? '').slice(0, 20)
          page.drawText(cellText, {
            x: margin + c * colWidth + 3,
            y: y + 2,
            size: fontSize,
            font: isHeader ? boldFont : font,
            color: isHeader ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
          })
        }
        y -= cellH
      }
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="spreadsheet.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Excel to PDF error:', error)
    return NextResponse.json({ error: 'Failed to convert Excel to PDF' }, { status: 500 })
  }
}
