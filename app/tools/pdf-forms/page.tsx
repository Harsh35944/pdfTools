'use client'
import { useState } from 'react'
import { FileSearch, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function PDFFormsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<{ name: string; type: string }[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setFields([]); setValues({}); setDownloadUrl(null); setError(null) }
  const onFiles = (f: File[]) => { setFile(f[0]); setFields([]); setDownloadUrl(null); setError(null) }

  const scanFields = async () => {
    if (!file) return
    setScanning(true); setError(null); setFields([])
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/pdf/pdf-forms', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.fields?.length) { setFields(data.fields); setValues({}) }
      else setError('No form fields detected in this PDF')
    } catch (e: any) { setError(e.message) }
    finally { setScanning(false) }
  }

  const handleFill = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('fields', JSON.stringify(values))
      const res = await fetch('/api/pdf/pdf-forms', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed') }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Fill PDF Forms" description="Fill and flatten interactive PDF form fields" icon={FileSearch} color="bg-gradient-to-br from-teal-500 to-teal-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF with form fields" />
          <p className="text-xs text-center text-gray-400">Works with fillable PDFs that have text boxes, checkboxes, and dropdowns.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          {fields.length === 0 && (
            <button onClick={scanFields} disabled={scanning}
              className="w-full bg-teal-100 hover:bg-teal-200 text-teal-700 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {scanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning for fields…</> : <><FileSearch className="w-5 h-5" /> Scan Form Fields</>}
            </button>
          )}

          {fields.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">📋 {fields.length} field{fields.length !== 1 ? 's' : ''} found</p>
                <button type="button" onClick={scanFields} className="text-xs text-teal-600 hover:underline">Re-scan</button>
              </div>
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {f.name} <span className="text-gray-300 font-normal">({f.type})</span>
                  </label>
                  <input type="text" value={values[f.name] || ''} onChange={e => setValues(p => ({ ...p, [f.name]: e.target.value }))}
                    placeholder={`Enter ${f.name}`}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition" />
                </div>
              ))}
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {fields.length > 0 && (downloadUrl ? (
            <a href={downloadUrl} download="filled-form.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Filled PDF
            </a>
          ) : (
            <button onClick={handleFill} disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Filling…</> : 'Fill & Download PDF'}
            </button>
          ))}
        </div>
      )}
    </ToolPage>
  )
}
