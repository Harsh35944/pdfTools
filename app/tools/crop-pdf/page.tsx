'use client'
import { useState } from 'react'
import { Crop, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function CropPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'margins' | 'box'>('margins')
  const [top, setTop] = useState(0)
  const [right, setRight] = useState(0)
  const [bottom, setBottom] = useState(0)
  const [left, setLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('mode', mode)
      fd.append('top', top.toString()); fd.append('right', right.toString())
      fd.append('bottom', bottom.toString()); fd.append('left', left.toString())
      const res = await fetch('/api/pdf/crop-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Crop PDF" description="Trim margins or set a custom crop box for all pages" icon={Crop} color="bg-gradient-to-br from-teal-500 to-teal-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to crop" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Crop Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'margins', icon: '📐', label: 'Trim Margins', sub: 'Remove white space by pts' },
                { id: 'box', icon: '✂️', label: 'Crop Box', sub: 'Set visible area directly' },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setMode(m.id as any)}
                  className={`py-4 rounded-2xl flex flex-col items-center gap-1 border-2 text-sm font-semibold transition ${mode === m.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-200'}`}>
                  <span className="text-2xl">{m.icon}</span><span>{m.label}</span>
                  <span className="font-normal text-xs opacity-60">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual crop diagram */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <p className="text-xs text-gray-500 text-center mb-4">{mode === 'margins' ? 'Trim (pts) from each edge' : 'Crop box (pts from page origin)'}</p>
            <div className="flex flex-col items-center gap-2">
              <input type="number" value={top} onChange={e => setTop(+e.target.value)} min={0}
                className="w-24 text-center border-2 border-gray-200 rounded-xl py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Top" />
              <div className="flex items-center gap-2">
                <input type="number" value={left} onChange={e => setLeft(+e.target.value)} min={0}
                  className="w-24 text-center border-2 border-gray-200 rounded-xl py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Left" />
                <div className="w-24 h-16 border-2 border-dashed border-teal-400 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-teal-500 font-medium">Page</span>
                </div>
                <input type="number" value={right} onChange={e => setRight(+e.target.value)} min={0}
                  className="w-24 text-center border-2 border-gray-200 rounded-xl py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Right" />
              </div>
              <input type="number" value={bottom} onChange={e => setBottom(+e.target.value)} min={0}
                className="w-24 text-center border-2 border-gray-200 rounded-xl py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Bottom" />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="cropped.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Cropped PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Cropping...</> : <><Crop className="w-5 h-5" /> Crop PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
