'use client'
import { useState } from 'react'
import { ImageDown, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

function fmtSize(b: number) { return b < 1024**2 ? (b/1024).toFixed(0)+' KB' : (b/1024**2).toFixed(2)+' MB' }

export default function CompressImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [quality, setQuality] = useState(80)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [compSize, setCompSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setCompSize(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setCompSize(null); setError(null); setPreview(URL.createObjectURL(f[0])) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setCompSize(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('quality', quality.toString())
      const res = await fetch('/api/image/compress', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const blob = await res.blob()
      setCompSize(blob.size)
      setDownloadUrl(URL.createObjectURL(blob))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const savings = compSize && file ? Math.max(0, Math.round((1 - compSize / file.size) * 100)) : 0

  return (
    <ToolPage title="Compress Image" description="Reduce image file size while keeping quality" icon={ImageDown} color="bg-gradient-to-br from-emerald-500 to-emerald-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={false} label="Select image to compress" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700">Quality</label>
              <span className="text-sm font-bold text-emerald-600">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)} className="w-full accent-emerald-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Smaller file</span><span>Best quality</span></div>
          </div>

          {compSize && file && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">-{savings}%</p>
              <p className="text-sm text-gray-500 mt-1">{fmtSize(file.size)} → {fmtSize(compSize)}</p>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`compressed_${file?.name}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Compressed Image
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Compressing...</> : <><ImageDown className="w-5 h-5" /> Compress Image</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
