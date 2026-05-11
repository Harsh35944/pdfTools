import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(req: NextRequest) {
  try {
    const { url, html } = await req.json()

    if (!url && !html) {
      return NextResponse.json({ error: 'URL or HTML string required' }, { status: 400 })
    }

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle2' })
    } else {
      await page.setContent(html, { waitUntil: 'networkidle2' })
    }

    const pdfBytes = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="webpage.pdf"',
      },
    })
  } catch (error: any) {
    console.error('HTML to PDF Error:', error)
    return NextResponse.json({ error: 'Failed to convert HTML to PDF' }, { status: 500 })
  }
}
