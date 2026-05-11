'use client'
import { useState } from 'react'
import { Globe, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileCard from '@/components/FileCard'

export default function HtmlToPdfPage() {
  const [url, setUrl] = useState('')
  const [htmlFile, setHtmlFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'url' | 'file'>('url')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetFile = () => { setHtmlFile(null); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (mode === 'url' && !url.trim()) { setError('Enter a URL'); return }
    if (mode === 'file' && !htmlFile) { setError('Select an HTML file'); return }
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData()
      fd.append('mode', mode)
      if (mode === 'url') fd.append('url', url)
      else fd.append('file', htmlFile!)
      const res = await fetch('/api/pdf/html-to-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="HTML to PDF" description="Convert any webpage or HTML file to PDF" icon={Globe} color="bg-gradient-to-br from-indigo-500 to-indigo-700">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          {[{id:'url',label:'🌐 URL'},{id:'file',label:'📄 HTML File'}].map(m => (
            <button key={m.id} type="button" onClick={() => { setMode(m.id as any); setDownloadUrl(null); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === m.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'url' ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Page URL</label>
            <input value={url} onChange={e => { setUrl(e.target.value); setDownloadUrl(null) }}
              placeholder="https://example.com"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition" />
          </div>
        ) : (
          <div>
            {!htmlFile ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">HTML File</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 cursor-pointer hover:border-indigo-400 transition">
                  <span className="text-3xl mb-2">📄</span>
                  <span className="text-sm text-gray-500">Click to select .html file</span>
                  <input type="file" accept=".html,.htm" className="hidden" onChange={e => e.target.files && setHtmlFile(e.target.files[0])} />
                </label>
              </div>
            ) : (
              <FileCard file={htmlFile} onRemove={resetFile} />
            )}
          </div>
        )}

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-xs text-indigo-700">
          🤖 Uses Puppeteer headless browser for pixel-perfect rendering. JavaScript is executed.
        </div>

        {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Launching headless browser… this may take 10–30 seconds.</p>}
        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {downloadUrl ? (
          <a href={downloadUrl} download="converted.pdf"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
            <Download className="w-5 h-5" /> Download PDF
          </a>
        ) : (
          <button onClick={handle} disabled={loading || (mode === 'url' ? !url.trim() : !htmlFile)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Globe className="w-5 h-5" /> Convert to PDF</>}
          </button>
        )}
      </div>
    </ToolPage>
  )
}
