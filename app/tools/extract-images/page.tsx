'use client'
import { useState } from 'react'
import { Images, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function ExtractImagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setCount(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setCount(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setCount(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/pdf/extract-images', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const c = res.headers.get('X-Image-Count')
      if (c) setCount(parseInt(c))
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Extract Images" description="Pull all embedded images out of a PDF" icon={Images} color="bg-gradient-to-br from-pink-500 to-pink-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to extract images from" />
          <p className="text-xs text-center text-gray-400">Extracted images are delivered as a ZIP archive. Supports JPEG, PNG, and other embedded formats.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          {count !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
              📦 {count} image{count !== 1 ? 's' : ''} extracted — ready to download as ZIP
            </div>
          )}

          {count === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              ⚠️ No embedded images found in this PDF.
            </div>
          )}

          {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Scanning PDF for embedded images…</p>}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="extracted_images.zip"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download ZIP ({count} images)
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</> : <><Images className="w-5 h-5" /> Extract Images</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
