import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, html, width = 1280, height = 720, fullPage = true } = body
    if (!url && !html) return NextResponse.json({ error: 'URL or HTML required' }, { status: 400 })

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setViewport({ width: Math.max(1, width), height: Math.max(1, height) })

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    } else {
      await page.setContent(html, { waitUntil: 'networkidle2' })
    }

    // fullPage=true captures the full scrollable page (not just viewport)
    // For URL: default fullPage=true for full-page screenshot
    // For viewport-only: pass fullPage=false
    const screenshot = await page.screenshot({ type: 'png', fullPage: !!fullPage })
    await browser.close()

    return new NextResponse(Buffer.from(screenshot), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="screenshot.png"',
      },
    })
  } catch (error: any) {
    console.error('HTML to Image error:', error)
    return NextResponse.json({ error: 'Failed to capture screenshot: ' + error.message }, { status: 500 })
  }
}
