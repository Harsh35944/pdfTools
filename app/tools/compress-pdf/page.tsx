'use client'
import { useState } from 'react'
import { Minimize2, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const LEVELS = [
  { id: 'low', emoji: '🟢', label: 'Less compression', sub: 'Highest quality', color: 'border-green-400 bg-green-50 text-green-700' },
  { id: 'medium', emoji: '🟡', label: 'Recommended', sub: 'Good quality & size', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { id: 'high', emoji: '🔴', label: 'Extreme', sub: 'Smallest file size', color: 'border-red-400 bg-red-50 text-red-700' },
]

function fmtSize(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 ** 2) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1024 ** 2).toFixed(2) + ' MB'
}

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [savings, setSavings] = useState<{ orig: number; comp: number; pct: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setSavings(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setSavings(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setSavings(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('level', level)
      const res = await fetch('/api/pdf/compress', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const compSize = parseInt(res.headers.get('X-Compressed-Size') || '0')
      const pct = parseInt(res.headers.get('X-Savings-Percent') || '0')
      const blob = await res.blob()
      setDownloadUrl(URL.createObjectURL(blob))
      setSavings({ orig: file.size, comp: compSize || blob.size, pct: Math.max(0, pct) })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Compress PDF" description="Reduce PDF file size while maintaining quality" icon={Minimize2} color="bg-gradient-to-br from-green-600 to-green-800">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select or drop your PDF here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <FileCard file={file} onRemove={reset} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Compression Level</label>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((l) => (
                <button key={l.id} type="button" onClick={() => setLevel(l.id)}
                  className={`py-5 rounded-2xl text-sm flex flex-col items-center gap-1.5 border-2 font-semibold transition ${level === l.id ? l.color + ' border-2' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span className="text-2xl">{l.emoji}</span>
                  <span>{l.label}</span>
                  <span className="font-normal text-xs opacity-70">{l.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {savings && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">-{savings.pct}%</p>
              <p className="text-sm text-gray-500 mt-1">{fmtSize(savings.orig)} → {fmtSize(savings.comp)}</p>
            </div>
          )}

          {downloadUrl ? (
            <a href={downloadUrl} download="compressed.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Compressed PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Compressing...</> : <><Minimize2 className="w-5 h-5" /> Compress PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
