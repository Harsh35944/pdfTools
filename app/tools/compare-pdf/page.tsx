'use client'
import { useState } from 'react'
import { GitCompare, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

function fmtSize(b: number) { return b < 1024**2 ? (b/1024).toFixed(0)+' KB' : (b/1024**2).toFixed(1)+' MB' }

export default function ComparePdfPage() {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ identical: boolean; differences: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile1(null); setFile2(null); setResult(null); setError(null) }

  const handle = async () => {
    if (!file1 || !file2) { setError('Select both PDF files'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const fd = new FormData(); fd.append('file1', file1); fd.append('file2', file2)
      const res = await fetch('/api/pdf/compare-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Compare PDF" description="Find differences between two PDF documents" icon={GitCompare} color="bg-gradient-to-br from-purple-600 to-purple-900">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">PDF 1 — Original</p>
            {!file1 ? (
              <FileUpload onFiles={f => { setFile1(f[0]); setResult(null) }} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select first PDF" />
            ) : (
              <FileCard file={file1} onRemove={() => { setFile1(null); setResult(null) }} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">PDF 2 — Modified</p>
            {!file2 ? (
              <FileUpload onFiles={f => { setFile2(f[0]); setResult(null) }} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select second PDF" />
            ) : (
              <FileCard file={file2} onRemove={() => { setFile2(null); setResult(null) }} />
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {result && (
          <div className={`rounded-2xl p-4 border-2 ${result.identical ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
            <p className={`font-bold text-lg mb-2 ${result.identical ? 'text-green-700' : 'text-orange-700'}`}>
              {result.identical ? '✅ Files are identical' : `⚠️ ${result.differences.length} difference(s) found`}
            </p>
            {result.differences.map((d, i) => (
              <p key={i} className="text-sm text-orange-700 flex gap-2">
                <span className="font-mono">•</span>{d}
              </p>
            ))}
          </div>
        )}

        <button onClick={handle} disabled={loading || !file1 || !file2}
          className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Comparing...</> : <><GitCompare className="w-5 h-5" /> Compare PDFs</>}
        </button>
      </div>
    </ToolPage>
  )
}
