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
    const userPassword = (formData.get('userPassword') as string) || ''
    const ownerPassword = (formData.get('ownerPassword') as string) || userPassword + '_owner'
    const keyLength = parseInt(formData.get('keyLength') as string) || 128

    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })
    if (!userPassword) return NextResponse.json({ error: 'Password required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const tmpDir = os.tmpdir()
    const id = crypto.randomUUID()
    const inputPath = path.join(tmpDir, `${id}_in.pdf`)
    const outputPath = path.join(tmpDir, `${id}_out.pdf`)

    await fs.writeFile(inputPath, buffer)

    return new Promise((resolve) => {
      // qpdf --encrypt <user-pass> <owner-pass> <bits> -- input output
      const cmd = `qpdf --encrypt "${userPassword}" "${ownerPassword}" ${keyLength} -- "${inputPath}" "${outputPath}"`
      exec(cmd, async (error) => {
        if (error) {
          await fs.unlink(inputPath).catch(() => {})
          // qpdf not found â€” return a clear error
          resolve(NextResponse.json({
            error: 'PDF encryption requires qpdf. Install it with: choco install qpdf (Windows) or brew install qpdf (Mac) or apt install qpdf (Linux)',
          }, { status: 503 }))
          return
        }
        try {
          const outBuffer = await fs.readFile(outputPath)
          await fs.unlink(inputPath).catch(() => {})
          await fs.unlink(outputPath).catch(() => {})
          resolve(new NextResponse(Buffer.from(outBuffer), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="protected.pdf"',
            },
          }))
        } catch {
          resolve(NextResponse.json({ error: 'Failed to read encrypted PDF' }, { status: 500 }))
        }
      })
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to protect PDF' }, { status: 500 })
  }
}

