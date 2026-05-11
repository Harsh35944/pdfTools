import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import path from 'path'
import { spawn } from 'child_process'

const EXTRACTOR = path.join(process.cwd(), 'scripts', 'pdf-extract-text.js')

function extractTextPages(pdfBuffer: Buffer): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [EXTRACTOR], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', (c: Buffer) => out.push(c))
    child.stderr.on('data', (c: Buffer) => err.push(c))
    child.on('close', (code) => {
      if (code === 0) {
        try { resolve(JSON.parse(Buffer.concat(out).toString())) }
        catch { reject(new Error('Invalid extractor output')) }
      } else {
        reject(new Error(Buffer.concat(err).toString() || `Exit ${code}`))
      }
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
    const pages = await extractTextPages(buffer)

    const wb = XLSX.utils.book_new()

    pages.forEach((lines, idx) => {
      // Try to detect tab/space-delimited rows as table cells
      const rows = lines.map((line) =>
        line.split(/\s{2,}|\t/).map((cell) => cell.trim()).filter(Boolean)
      )
      const ws = XLSX.utils.aoa_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, `Page ${idx + 1}`)
    })

    const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(Buffer.from(xlsxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="extracted.xlsx"',
      },
    })
  } catch (error: any) {
    console.error('PDF to Excel error:', error)
    return NextResponse.json({ error: 'Failed to convert PDF to Excel' }, { status: 500 })
  }
}

