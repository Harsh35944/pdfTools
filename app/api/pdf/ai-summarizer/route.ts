import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

const EXTRACTOR = path.join(process.cwd(), 'scripts', 'pdf-extract-text.js')

function extractText(pdfBuffer: Buffer): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [EXTRACTOR], { stdio: ['pipe', 'pipe', 'pipe'] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', (c: Buffer) => out.push(c))
    child.stderr.on('data', (c: Buffer) => err.push(c))
    child.on('close', (code) => {
      if (code === 0) { try { resolve(JSON.parse(Buffer.concat(out).toString())) } catch { reject(new Error('Parse error')) } }
      else reject(new Error(Buffer.concat(err).toString()))
    })
    child.on('error', reject)
    child.stdin.write(pdfBuffer)
    child.stdin.end()
  })
}

function extractiveSummarize(text: string, sentenceCount: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  if (sentences.length <= sentenceCount) return sentences.join(' ')
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  const freq: Record<string, number> = {}
  const stopWords = new Set(['the','and','for','are','was','with','that','this','from','have','will','been','they','their','which','when','also','into','more','than','but','not','its','can','has','had','all','would','there','what','about','who','how','some','your','our','out','use'])
  words.forEach(w => { if (w.length > 3 && !stopWords.has(w)) freq[w] = (freq[w] || 0) + 1 })
  const scored = sentences.map(sent => ({
    sent: sent.trim(),
    score: sent.toLowerCase().split(/\s+/).reduce((sum, w) => sum + (freq[w] || 0), 0) / (sent.split(/\s+/).length || 1)
  }))
  return scored.sort((a, b) => b.score - a.score).slice(0, sentenceCount).map(s => s.sent).join(' ')
}

function extractKeyTopics(text: string, topN = 6): string[] {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  const stopWords = new Set(['the','and','for','are','was','with','that','this','from','have','will','been','they','their','which','when','also','into','more','than','but','not','its','can','has','had','all','would','there','what','about','who','how','some','your','our','out','use','pdf','page','section','figure'])
  const freq: Record<string, number> = {}
  words.forEach(w => { if (w.length > 4 && !stopWords.has(w)) freq[w] = (freq[w] || 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([w]) => w.charAt(0).toUpperCase() + w.slice(1))
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const sentences = parseInt(formData.get('sentences') as string) || 5
    if (!file) return NextResponse.json({ error: 'PDF file required' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const pages = await extractText(buffer)
    const fullText = pages.flat().join(' ')

    const summary = extractiveSummarize(fullText, sentences)
    const keyTopics = extractKeyTopics(fullText)
    const wordCount = fullText.split(/\s+/).filter(Boolean).length
    const charCount = fullText.length
    const pageCount = pages.length
    const readingTimeMin = Math.ceil(wordCount / 200)

    return NextResponse.json({ summary, keyTopics, wordCount, charCount, pageCount, sentenceCount: sentences, readingTimeMin })
  } catch (error: any) {
    console.error('AI Summarizer error:', error)
    return NextResponse.json({ error: 'Failed to summarize PDF' }, { status: 500 })
  }
}
