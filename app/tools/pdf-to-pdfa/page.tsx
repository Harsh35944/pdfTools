'use client'
import { useState } from 'react'
import { Shield, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const LEVELS = [
  { id: 'pdfa-1b', label: 'PDF/A-1b', badge: 'Most compatible', desc: 'Basic visual reproducibility — recommended for most use cases', color: 'border-slate-500 bg-slate-50 text-slate-700' },
  { id: 'pdfa-1a', label: 'PDF/A-1a', badge: 'Accessible', desc: 'Adds tagged structure for screen readers', color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { id: 'pdfa-2b', label: 'PDF/A-2b', badge: 'Modern', desc: 'Supports JPEG2000, layers, transparency', color: 'border-purple-500 bg-purple-50 text-purple-700' },
  { id: 'pdfa-3b', label: 'PDF/A-3b', badge: 'Extended', desc: 'Allows file attachments inside the PDF', color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
]

export default function PdfToPdfaPage() {
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState('pdfa-1b')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('level', level)
      const res = await fetch('/api/pdf/pdf-to-pdfa', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed') }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="PDF to PDF/A" description="Convert to ISO-standardized archival format" icon={Shield} color="bg-gradient-to-br from-slate-600 to-slate-900">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to archive" />
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
            <p className="font-semibold mb-1">What is PDF/A?</p>
            <p className="text-xs">PDF/A is an ISO standard (19005) for long-term digital preservation. It embeds all fonts, disables encryption, and includes XMP metadata for maximum archival reliability.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Conformance Level</label>
            {LEVELS.map(l => (
              <label key={l.id} onClick={() => setLevel(l.id)}
                className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${level === l.id ? l.color + ' border-2' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${level === l.id ? 'border-current' : 'border-gray-300'}`}>
                  {level === l.id && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{l.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 border font-medium">{l.badge}</span>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">{l.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            ⚠️ For strict ISO 19005 validation, post-process with Ghostscript or VeraPDF.
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`${file.name.replace('.pdf', '')}_${level}.pdf`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PDF/A File
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Shield className="w-5 h-5" /> Convert to PDF/A</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
