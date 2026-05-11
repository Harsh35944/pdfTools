'use client'
import { useState } from 'react'
import { Eraser, Download, Loader2, Info } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function RemoveBgPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [tolerance, setTolerance] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setResultUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setResultUrl(null); setError(null); setPreview(URL.createObjectURL(f[0])) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setResultUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tolerance', tolerance.toString())
      const res = await fetch('/api/image/remove-bg', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setResultUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Remove Background" description="Remove image background automatically" icon={Eraser} color="bg-gradient-to-br from-fuchsia-500 to-fuchsia-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={false} label="Select image to remove background" />
          <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl p-3 text-xs text-fuchsia-700 flex gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Works best on solid/uniform backgrounds. For complex photos, increase tolerance. Output: transparent PNG.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          {/* Tolerance slider — now exposed in UI */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Background Tolerance</label>
              <span className="text-sm font-bold text-fuchsia-600">{tolerance}</span>
            </div>
            <input type="range" min={10} max={150} value={tolerance} onChange={e => setTolerance(+e.target.value)} className="w-full accent-fuchsia-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Strict (solid color only)</span>
              <span>Loose (gradient/shadows)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              💡 If background remains: increase tolerance. If subject disappears: decrease it.
            </p>
          </div>

          {/* Before / After comparison */}
          {resultUrl && (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-2">Original</p>
                <img src={preview!} alt="before" className="w-full h-36 object-contain rounded-xl bg-gray-100" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-2">Background Removed</p>
                <img src={resultUrl} alt="after" className="w-full h-36 object-contain rounded-xl"
                  style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px' }} />
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {resultUrl ? (
            <div className="space-y-2">
              <a href={resultUrl} download={`nobg_${file?.name?.replace(/\.[^.]+$/, '')}.png`}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
                <Download className="w-5 h-5" /> Download PNG (transparent)
              </a>
              <button onClick={handle} disabled={loading}
                className="w-full border-2 border-fuchsia-300 text-fuchsia-600 font-semibold py-3 rounded-2xl hover:bg-fuchsia-50 transition text-sm">
                {loading ? 'Processing…' : '↺ Try again with different tolerance'}
              </button>
            </div>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Removing Background...</> : <><Eraser className="w-5 h-5" /> Remove Background</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
