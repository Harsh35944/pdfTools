'use client'
import { useState } from 'react'
import { Sparkles, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const SCALES = [
  { val: 2, label: '2×', sub: 'Double size' },
  { val: 3, label: '3×', sub: 'Triple size' },
  { val: 4, label: '4×', sub: 'Quad size' },
]

export default function UpscaleImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scale, setScale] = useState(2)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null); setPreview(URL.createObjectURL(f[0])) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('scale', scale.toString())
      const res = await fetch('/api/image/upscale', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Upscale Image" description="Increase image resolution without losing quality" icon={Sparkles} color="bg-gradient-to-br from-amber-500 to-amber-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={false} label="Select image to upscale" />
          <p className="text-xs text-center text-gray-400">⚡ Uses sharp's Lanczos algorithm. Best results on sharp-edged images.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Scale Factor</label>
            <div className="grid grid-cols-3 gap-3">
              {SCALES.map(s => (
                <button key={s.val} type="button" onClick={() => setScale(s.val)}
                  className={`py-5 rounded-2xl flex flex-col items-center gap-1 border-2 font-semibold transition ${scale === s.val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-200'}`}>
                  <span className="text-2xl font-black">{s.label}</span>
                  <span className="text-xs font-normal opacity-70">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`upscaled_${scale}x_${file?.name}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Upscaled Image
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Upscaling...</> : <><Sparkles className="w-5 h-5" /> Upscale {scale}×</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
