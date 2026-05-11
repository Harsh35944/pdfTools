'use client'
import { useState } from 'react'
import { Sparkles, Loader2, FileText, Copy, Check, BookOpen, Hash } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function AISummarizerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [sentences, setSentences] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    summary: string; keyTopics: string[]; wordCount: number
    charCount: number; pageCount: number; readingTimeMin: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => { setFile(null); setResult(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setResult(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setResult(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('sentences', sentences.toString())
      const res = await fetch('/api/pdf/ai-summarizer', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const copy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.summary)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolPage title="AI Summarizer" description="Instantly summarize any PDF document with key insights" icon={Sparkles} color="bg-gradient-to-br from-purple-600 to-pink-600">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to summarize" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[['🧠', 'Smart extraction', 'Frequency-based sentence scoring'], ['📝', 'Key topics', 'Top keywords identified'], ['⏱️', 'Reading time', 'Estimate for full document']].map(([e, t, d]) => (
              <div key={t} className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-2xl">{e}</p>
                <p className="text-xs font-semibold text-purple-700 mt-1">{t}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Summary Length</label>
              <span className="text-sm font-bold text-purple-600">{sentences} sentences</span>
            </div>
            <input type="range" min={3} max={15} value={sentences} onChange={e => setSentences(+e.target.value)} className="w-full accent-purple-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Brief (3)</span><span>Detailed (15)</span></div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {!result ? (
            <button onClick={handle} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Summarizing...</> : <><Sparkles className="w-5 h-5" /> Summarize PDF</>}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: <BookOpen className="w-4 h-4" />, label: 'Pages', value: result.pageCount },
                  { icon: <Hash className="w-4 h-4" />, label: 'Words', value: result.wordCount.toLocaleString() },
                  { icon: <FileText className="w-4 h-4" />, label: 'Read time', value: `~${result.readingTimeMin} min` },
                  { icon: <Sparkles className="w-4 h-4" />, label: 'Summary', value: `${sentences} sent.` },
                ].map(s => (
                  <div key={s.label} className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-purple-500 flex justify-center mb-1">{s.icon}</div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="font-bold text-purple-700 text-sm">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Key topics */}
              {result.keyTopics.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">🏷️ Key Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keyTopics.map(t => (
                      <span key={t} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary text */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><FileText className="w-4 h-4 text-purple-500" /> Summary</span>
                  <button onClick={copy} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition">
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
              </div>

              <button onClick={() => setResult(null)}
                className="w-full border-2 border-purple-200 text-purple-600 font-semibold py-3 rounded-2xl hover:bg-purple-50 transition">
                Summarize Again
              </button>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  )
}
