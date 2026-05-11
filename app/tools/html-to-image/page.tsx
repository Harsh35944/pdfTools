'use client'
import { useState } from 'react'
import { Camera, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function HtmlToImagePage() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<'png'|'jpeg'>('png')
  const [fullPage, setFullPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handle = async () => {
    if (!url.trim()) { setError('Enter a URL'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('url', url); fd.append('format', format); fd.append('fullPage', fullPage.toString())
      const res = await fetch('/api/image/html-to-image', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Website Screenshot" description="Capture any webpage as PNG or JPEG" icon={Camera} color="bg-gradient-to-br from-violet-500 to-violet-800">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website URL</label>
          <input value={url} onChange={e => { setUrl(e.target.value); setDownloadUrl(null) }}
            placeholder="https://example.com"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 transition" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
            <div className="flex gap-2">
              {(['png','jpeg'] as const).map(f => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold uppercase transition ${format === f ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'}`}>
                  .{f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fullPage} onChange={e => setFullPage(e.target.checked)} className="w-4 h-4 accent-violet-600" />
              <span className="text-sm text-gray-700">Full page screenshot</span>
            </label>
          </div>
        </div>

        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-xs text-violet-700">
          🤖 Uses Puppeteer headless browser. Some sites may block automated access.
        </div>

        {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Rendering page… 10–30 seconds</p>}
        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {downloadUrl ? (
          <>
            <img src={downloadUrl} alt="screenshot" className="w-full rounded-xl border border-gray-200 max-h-64 object-top object-cover" />
            <a href={downloadUrl} download={`screenshot.${format}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download .{format.toUpperCase()}
            </a>
          </>
        ) : (
          <button onClick={handle} disabled={loading || !url.trim()}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Capturing...</> : <><Camera className="w-5 h-5" /> Capture Screenshot</>}
          </button>
        )}
      </div>
    </ToolPage>
  )
}
