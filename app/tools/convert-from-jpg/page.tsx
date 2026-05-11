'use client'
import { useState } from 'react'
import { RefreshCw, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const OUTPUT_FORMATS = ['png', 'webp', 'gif', 'bmp', 'tiff']

export default function ConvertFromJpgPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [format, setFormat] = useState('png')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setPreview(null); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null); setPreview(URL.createObjectURL(f[0])) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('format', format)
      const res = await fetch('/api/image/convert-from-jpg', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="JPG Converter" description="Convert JPG to PNG, WebP, GIF and more" icon={RefreshCw} color="bg-gradient-to-br from-orange-500 to-orange-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'image/jpeg': ['.jpg','.jpeg'] }} multiple={false} label="Select JPG image to convert" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} preview={preview || undefined} />

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold text-gray-400">JPG</span>
              <span className="text-gray-300 text-xl">→</span>
              <span className="text-sm font-bold text-orange-600 uppercase">{format}</span>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Convert To</label>
            <div className="grid grid-cols-5 gap-2">
              {OUTPUT_FORMATS.map(f => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`py-3 rounded-xl border-2 text-xs font-bold uppercase transition ${format === f ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}>
                  .{f}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`converted.${format}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download .{format.toUpperCase()}
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><RefreshCw className="w-5 h-5" /> Convert to .{format.toUpperCase()}</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
