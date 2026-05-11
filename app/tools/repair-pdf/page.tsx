'use client'
import { useState } from 'react'
import { Wrench, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function RepairPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [repaired, setRepaired] = useState(false)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null); setRepaired(false) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null); setRepaired(false) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setRepaired(false)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/pdf/repair-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Repair failed') }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
      setRepaired(true)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Repair PDF" description="Fix corrupted or damaged PDF files automatically" icon={Wrench} color="bg-gradient-to-br from-gray-600 to-gray-900">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select your damaged PDF here" />
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[['🔧', 'Re-structure', 'Rebuilds the PDF object tree'], ['📄', 'Re-embed pages', 'Copies pages to a clean doc'], ['💾', 'Re-save', 'Writes a clean valid PDF']].map(([icon, title, desc]) => (
              <div key={title} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-xs font-semibold text-gray-700">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          {!repaired && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              ⚠️ Works best for minor corruption. Severely damaged files may not recover all content.
            </div>
          )}

          {repaired && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="w-5 h-5" /> PDF Successfully Repaired
              </div>
              {[
                '✔ Re-structured PDF object tree',
                '✔ Re-embedded all recoverable pages',
                '✔ Saved as a fresh, valid PDF',
              ].map(s => <p key={s} className="text-sm text-green-600 ml-7">{s}</p>)}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {downloadUrl ? (
            <a href={downloadUrl} download="repaired.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Repaired PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Repairing...</> : <><Wrench className="w-5 h-5" /> Repair PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
