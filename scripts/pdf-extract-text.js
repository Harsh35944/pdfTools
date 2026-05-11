#!/usr/bin/env node
/**
 * PDF text extractor — run as child process
 * Reads PDF from stdin, outputs JSON array of pages (each page = array of lines) to stdout
 */
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js')
const path = require('path')

pdfjs.GlobalWorkerOptions.workerSrc = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.js'
)

const chunks = []
process.stdin.on('data', (c) => chunks.push(c))
process.stdin.on('end', async () => {
  try {
    const buffer = Buffer.concat(chunks)
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true })
    const pdf = await loadingTask.promise
    const result = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const lines = []
      let currentLine = ''
      let lastY = null

      for (const item of content.items) {
        if ('str' in item) {
          const y = item.transform ? Math.round(item.transform[5]) : 0
          if (lastY !== null && Math.abs(y - lastY) > 4) {
            if (currentLine.trim()) lines.push(currentLine.trim())
            currentLine = item.str
          } else {
            currentLine += item.str
          }
          lastY = y
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim())
      result.push(lines)
    }

    process.stdout.write(JSON.stringify(result))
    process.exit(0)
  } catch (err) {
    process.stderr.write(JSON.stringify({ error: err.message }))
    process.exit(1)
  }
})
