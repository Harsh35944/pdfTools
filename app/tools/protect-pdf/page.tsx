'use client'
import { useState } from 'react'
import { Lock, Download, Loader2, AlertTriangle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [userPwd, setUserPwd] = useState('')
  const [ownerPwd, setOwnerPwd] = useState('')
  const [keyLength, setKeyLength] = useState<40 | 128 | 256>(128)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [qpdfMissing, setQpdfMissing] = useState(false)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null); setQpdfMissing(false) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null); setQpdfMissing(false) }

  const handle = async () => {
    if (!file || !userPwd) return
    setLoading(true); setError(null); setDownloadUrl(null); setQpdfMissing(false)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('userPassword', userPwd)
      fd.append('ownerPassword', ownerPwd || userPwd + '_owner')
      fd.append('keyLength', keyLength.toString())
      const res = await fetch('/api/pdf/protect', { method: 'POST', body: fd })
      if (res.status === 503) { setQpdfMissing(true); setLoading(false); return }
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Protect PDF" description="Password protect your PDF with AES encryption" icon={Lock} color="bg-gradient-to-br from-red-600 to-red-800">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select or drop your PDF here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password to open <span className="text-red-500">*</span></label>
            <input type="password" value={userPwd} onChange={e => setUserPwd(e.target.value)}
              placeholder="Enter password" autoFocus
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner password <span className="text-xs font-normal text-gray-400">(optional – controls edit rights)</span></label>
            <input type="password" value={ownerPwd} onChange={e => setOwnerPwd(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Encryption strength</label>
            <div className="flex gap-2">
              {([40, 128, 256] as const).map(bits => (
                <button key={bits} type="button" onClick={() => setKeyLength(bits)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition ${keyLength === bits ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                  {bits}-bit
                  <span className="block text-xs font-normal opacity-60">{bits === 40 ? 'RC4' : bits === 128 ? 'AES' : 'AES-256'}</span>
                </button>
              ))}
            </div>
          </div>

          {qpdfMissing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-700">qpdf not installed on server</p>
                <p className="text-amber-600 mt-1 font-mono text-xs">choco install qpdf / brew install qpdf / apt install qpdf</p>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="protected.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Protected PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading || !userPwd}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Encrypting...</> : <><Lock className="w-5 h-5" /> Protect PDF</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
