'use client'
import { useState } from 'react'
import { RotateCw, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const ANGLES = [
  { val: 90,  label: '90° Right',  icon: '↻' },
  { val: 270, label: '90° Left',   icon: '↺' },
  { val: 180, label: '180°',       icon: '🔄' },
]

export default function RotateImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [angle, setAngle] = useState(90)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => {
    setFile(f[0]); setDownloadUrl(null); setError(null)
    setPreview(URL.createObjectURL(f[0]))
  }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('angle', angle.toString())
      const res = await fetch('/api/image/rotate', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Rotate Image" description="Rotate your image 90°, 180° or 270°" icon={RotateCw} color="bg-gradient-to-br from-violet-500 to-violet-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp','.gif'] }} multiple={false} label="Select image to rotate" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="preview" className="max-h-40 rounded-xl object-contain border border-gray-100"
                style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.3s' }} />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Rotation</label>
            <div className="grid grid-cols-3 gap-3">
              {ANGLES.map(a => (
                <button key={a.val} type="button" onClick={() => setAngle(a.val)}
                  className={`py-5 rounded-2xl flex flex-col items-center gap-2 border-2 text-sm font-semibold transition ${angle === a.val ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-violet-200'}`}>
                  <span className="text-2xl">{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`rotated_${file?.name}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Rotated Image
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Rotating...</> : <><RotateCw className="w-5 h-5" /> Rotate Image</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}