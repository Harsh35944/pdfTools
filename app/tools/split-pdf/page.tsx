'use client'
import { useState } from 'react'
import { Scissors, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'range' | 'each'>('each')
  const [pageRange, setPageRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState('split.pdf')
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('mode', mode)
      if (mode === 'range') fd.append('pageRange', pageRange)
      const res = await fetch('/api/pdf/split', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const isZip = res.headers.get('Content-Type')?.includes('zip')
      const name = isZip ? 'split_pages.zip' : 'split.pdf'
      setDownloadName(name)
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Split PDF" description="Extract pages or split into individual files" icon={Scissors} color="bg-gradient-to-br from-orange-500 to-orange-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select or drop your PDF here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <FileCard file={file} onRemove={reset} />

          {/* Mode selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Split Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'each', icon: '📦', label: 'Extract all pages', sub: 'Each page → separate PDF (ZIP)' },
                { id: 'range', icon: '📄', label: 'Extract range', sub: 'Select specific pages' },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setMode(m.id as any)}
                  className={`py-5 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition text-sm font-semibold ${mode === m.id ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}>
                  <span className="text-3xl">{m.icon}</span>
                  <span>{m.label}</span>
                  <span className="font-normal text-xs opacity-60">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'range' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Page Range</label>
              <input value={pageRange} onChange={e => setPageRange(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10  (blank = all)"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={downloadName}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download {downloadName.endsWith('.zip') ? 'ZIP' : 'PDF'}
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Splitting...</> : <><Scissors className="w-5 h-5" /> Split PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}