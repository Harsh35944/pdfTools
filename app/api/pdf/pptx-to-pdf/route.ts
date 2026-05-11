import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'PowerPoint file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const tmpDir = os.tmpdir()
    const id = crypto.randomUUID()
    const ext = file.name.endsWith('.ppt') ? '.ppt' : '.pptx'
    const inputPath = path.join(tmpDir, `${id}${ext}`)
    const outputPath = path.join(tmpDir, `${id}.pdf`)

    await fs.writeFile(inputPath, buffer)

    return new Promise((resolve) => {
      exec(`libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${tmpDir}"`, async (error) => {
        if (error) {
          await fs.unlink(inputPath).catch(() => {})
          resolve(NextResponse.json({ error: 'Conversion failed. Ensure LibreOffice is installed.' }, { status: 500 }))
          return
        }
        try {
          const pdfBuffer = await fs.readFile(outputPath)
          await fs.unlink(inputPath).catch(() => {})
          await fs.unlink(outputPath).catch(() => {})
          resolve(new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="presentation.pdf"',
            },
          }))
        } catch {
          resolve(NextResponse.json({ error: 'Failed to read output file' }, { status: 500 }))
        }
      })
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to convert PowerPoint to PDF' }, { status: 500 })
  }
}

