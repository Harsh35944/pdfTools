'use client'
import { useState } from 'react'
import { RotateCw, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const ANGLES = [
  { label: '↻ 90° Right', val: 90, icon: '↻' },
  { label: '↺ 90° Left', val: 270, icon: '↺' },
  { label: '🔄 180°', val: 180, icon: '🔄' },
]

export default function RotatePDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [angle, setAngle] = useState(90)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null) }
  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('angle', angle.toString())
      const res = await fetch('/api/pdf/rotate', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Rotate PDF" description="Rotate all pages in your PDF — 90°, 180° or 270°" icon={RotateCw} color="bg-gradient-to-br from-teal-500 to-teal-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select or drop your PDF here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <FileCard file={file} onRemove={reset} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Rotation</label>
            <div className="grid grid-cols-3 gap-3">
              {ANGLES.map((a) => (
                <button key={a.val} type="button" onClick={() => setAngle(a.val)}
                  className={`py-5 rounded-2xl font-semibold text-sm flex flex-col items-center gap-2 border-2 transition ${angle === a.val ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                  <span className="text-2xl">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="rotated.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Rotated PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Rotating...</> : <><RotateCw className="w-5 h-5" /> Rotate PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
