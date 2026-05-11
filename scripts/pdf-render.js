#!/usr/bin/env node
/**
 * Standalone PDF-to-JPEG renderer.
 * Run as a child process to avoid webpack/global state contamination.
 *
 * Usage:
 *   node pdf-render.js <pageNumber>
 *   (PDF data is read from stdin)
 *
 * On success: writes JPEG bytes to stdout, exits 0
 * On failure: writes JSON error to stderr, exits 1
 */

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
const { createCanvas } = require('canvas')
const path = require('path')

// Point to v3 worker (same version — no mismatch)
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.js'
)

const pageNumber = parseInt(process.argv[2], 10) || 1

const chunks = []
process.stdin.on('data', (chunk) => chunks.push(chunk))
process.stdin.on('end', async () => {
  try {
    const data = Buffer.concat(chunks)

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      useSystemFonts: true,
    })

    const pdfDoc = await loadingTask.promise
    const pdfPage = await pdfDoc.getPage(pageNumber)

    const scale = 2
    const viewport = pdfPage.getViewport({ scale })
    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')

    await pdfPage.render({
      canvasContext: context,
      viewport,
      intent: 'print',
    }).promise

    const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
    process.stdout.write(jpgBuffer)
    process.exit(0)
  } catch (err) {
    process.stderr.write(JSON.stringify({ error: err.message }))
    process.exit(1)
  }
})
