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

    if (!file) {
      return NextResponse.json({ error: 'PDF file required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const tmpDir = os.tmpdir()
    const id = crypto.randomUUID()
    const inputPath = path.join(tmpDir, `${id}.pdf`)
    const outputDir = tmpDir
    const outputPath = path.join(tmpDir, `${id}.docx`)

    await fs.writeFile(inputPath, buffer)

    return new Promise((resolve, reject) => {
      exec(`libreoffice --headless --convert-to docx "${inputPath}" --outdir "${outputDir}"`, async (error, stdout, stderr) => {
        if (error) {
          console.error(`LibreOffice error: ${error.message}`);
          await fs.unlink(inputPath).catch(() => {});
          resolve(NextResponse.json({ error: 'Failed to convert PDF to Word. Ensure LibreOffice is installed and in PATH.' }, { status: 500 }))
          return;
        }

        try {
          const docxBuffer = await fs.readFile(outputPath)
          await fs.unlink(inputPath).catch(() => {})
          await fs.unlink(outputPath).catch(() => {})

          resolve(new NextResponse(Buffer.from(docxBuffer), {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': 'attachment; filename="converted.docx"',
            },
          }))
        } catch (readErr) {
          resolve(NextResponse.json({ error: 'Failed to read converted file' }, { status: 500 }))
        }
      })
    })

  } catch (error: any) {
    console.error('PDF to Word Error:', error)
    return NextResponse.json({ error: 'Failed to convert PDF to Word' }, { status: 500 })
  }
}

