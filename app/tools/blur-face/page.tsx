'use client'
import { useState } from 'react'
import { Eye, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function BlurFacePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [blurStrength, setBlurStrength] = useState(20)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null); setPreview(URL.createObjectURL(f[0])) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('blurStrength', blurStrength.toString())
      const res = await fetch('/api/image/blur-face', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Blur Faces" description="Automatically detect and blur faces in images" icon={Eye} color="bg-gradient-to-br from-slate-500 to-slate-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={false} label="Select image with faces to blur" />
          <p className="text-xs text-center text-gray-400">🔒 Privacy-first: all processing happens on the server. Images are not stored.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          <div>
            <div className="flex justify-between mb-1.5"><label className="text-sm font-semibold text-gray-700">Blur Strength</label><span className="text-sm font-bold text-slate-600">{blurStrength}px</span></div>
            <input type="range" min={5} max={50} value={blurStrength} onChange={e => setBlurStrength(+e.target.value)} className="w-full accent-slate-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Light</span><span>Heavy</span></div>
          </div>

          {downloadUrl && (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center"><p className="text-xs text-gray-400 mb-1.5">Original</p><img src={preview!} alt="before" className="w-full h-32 object-contain rounded-xl bg-gray-100" /></div>
              <div className="text-center"><p className="text-xs text-gray-400 mb-1.5">Blurred</p><img src={downloadUrl} alt="after" className="w-full h-32 object-contain rounded-xl bg-gray-100" /></div>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`blurred_${file?.name}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Blurred Image
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Detecting & Blurring...</> : <><Eye className="w-5 h-5" /> Blur Faces</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
