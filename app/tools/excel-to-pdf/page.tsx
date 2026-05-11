'use client'
import { useState } from 'react'
import { Table, Download, Loader2, AlertTriangle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null); setMissing(false) }
  const onFiles = (f: File[]) => { setFile(f[0]); setDownloadUrl(null); setError(null); setMissing(false) }

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setMissing(false)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/pdf/excel-to-pdf', { method: 'POST', body: fd })
      if (res.status === 503) { setMissing(true); setLoading(false); return }
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Excel to PDF" description="Convert .xls / .xlsx spreadsheets to PDF" icon={Table} color="bg-gradient-to-br from-green-700 to-green-900">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }} multiple={false} label="Select .xls or .xlsx file" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center"><div className="text-3xl">📊</div><div className="text-xs mt-1 text-gray-500">XLSX</div></div>
            <div className="text-2xl text-gray-300">→</div>
            <div className="text-center"><div className="text-3xl">📄</div><div className="text-xs mt-1 text-gray-500">PDF</div></div>
          </div>
          {missing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm"><p className="font-semibold text-amber-700">LibreOffice required</p>
                <p className="text-amber-600 text-xs mt-1 font-mono">choco install libreoffice</p></div>
            </div>
          )}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
          {downloadUrl ? (
            <a href={downloadUrl} download={file.name.replace(/\.xlsx?$/, '.pdf')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Table className="w-5 h-5" /> Convert to PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
