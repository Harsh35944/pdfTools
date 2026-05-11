'use client'
import { useState } from 'react'
import { Type, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const POS_GRID = [
  { id: 'top-left', label: '↖' }, { id: 'top-center', label: '↑' }, { id: 'top-right', label: '↗' },
  { id: 'bottom-left', label: '↙' }, { id: 'bottom-center', label: '↓' }, { id: 'bottom-right', label: '↘' },
]
const FORMATS = ['{n}', 'Page {n}', '{n} / {total}', '- {n} -']

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState('bottom-center')
  const [startFrom, setStartFrom] = useState(1)
  const [format, setFormat] = useState('{n}')
  const [fontSize, setFontSize] = useState(11)
  const [pageRange, setPageRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('position', position)
      fd.append('startFrom', startFrom.toString()); fd.append('format', format)
      fd.append('fontSize', fontSize.toString()); fd.append('pageRange', pageRange)
      const res = await fetch('/api/pdf/page-numbers', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Page Numbers" description="Add page numbers to your PDF with custom position & style" icon={Type} color="bg-gradient-to-br from-pink-500 to-pink-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select or drop your PDF here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          {/* Position grid — 6 positions (top/bottom × left/center/right) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
            <div className="grid grid-cols-3 gap-2">
              {POS_GRID.map(p => (
                <button key={p.id} type="button" onClick={() => setPosition(p.id)}
                  className={`py-3 rounded-xl border-2 text-lg font-bold transition ${position === p.id ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-400 hover:border-pink-200'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">{position.replace('-', ' ')}</p>
          </div>

          {/* Format presets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Number Format</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(f => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl border-2 font-mono text-sm transition ${format === f ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-pink-200'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Start numbering from</label>
              <input type="number" min={1} value={startFrom} onChange={e => setStartFrom(+e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs font-medium text-gray-500">Font size</label><span className="text-xs text-pink-600 font-bold">{fontSize}pt</span></div>
              <input type="range" min={8} max={24} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full mt-1.5 accent-pink-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 block mb-1">Apply to pages (blank = all)</label>
              <input value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="e.g. 2-10, 15"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="numbered.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Numbered PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</> : <><Type className="w-5 h-5" /> Add Page Numbers</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
