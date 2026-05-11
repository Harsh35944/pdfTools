'use client'
import { useState } from 'react'
import { Languages, Download, Loader2, AlertTriangle } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const LANGS = [
  { code: 'auto', flag: '🌐', label: 'Auto-detect' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', label: 'French' },
  { code: 'de', flag: '🇩🇪', label: 'German' },
  { code: 'it', flag: '🇮🇹', label: 'Italian' },
  { code: 'pt', flag: '🇵🇹', label: 'Portuguese' },
  { code: 'ru', flag: '🇷🇺', label: 'Russian' },
  { code: 'zh', flag: '🇨🇳', label: 'Chinese' },
  { code: 'ja', flag: '🇯🇵', label: 'Japanese' },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic' },
  { code: 'hi', flag: '🇮🇳', label: 'Hindi' },
  { code: 'ko', flag: '🇰🇷', label: 'Korean' },
  { code: 'nl', flag: '🇳🇱', label: 'Dutch' },
  { code: 'pl', flag: '🇵🇱', label: 'Polish' },
  { code: 'tr', flag: '🇹🇷', label: 'Turkish' },
  { code: 'sv', flag: '🇸🇪', label: 'Swedish' },
  { code: 'uk', flag: '🇺🇦', label: 'Ukrainian' },
  { code: 'vi', flag: '🇻🇳', label: 'Vietnamese' },
  { code: 'th', flag: '🇹🇭', label: 'Thai' },
  { code: 'id', flag: '🇮🇩', label: 'Indonesian' },
  { code: 'ms', flag: '🇲🇾', label: 'Malay' },
  { code: 'ro', flag: '🇷🇴', label: 'Romanian' },
  { code: 'el', flag: '🇬🇷', label: 'Greek' },
  { code: 'cs', flag: '🇨🇿', label: 'Czech' },
  { code: 'hu', flag: '🇭🇺', label: 'Hungarian' },
  { code: 'da', flag: '🇩🇰', label: 'Danish' },
  { code: 'fi', flag: '🇫🇮', label: 'Finnish' },
  { code: 'he', flag: '🇮🇱', label: 'Hebrew' },
  { code: 'ur', flag: '🇵🇰', label: 'Urdu' },
  { code: 'bn', flag: '🇧🇩', label: 'Bengali' },
]
const TARGET_LANGS = LANGS.filter(l => l.code !== 'auto')

export default function TranslatePDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('es')
  const [srcSearch, setSrcSearch] = useState('')
  const [tgtSearch, setTgtSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null); setWarning(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null); setWarning(null) }

  const filteredSrc = LANGS.filter(l => l.label.toLowerCase().includes(srcSearch.toLowerCase()))
  const filteredTgt = TARGET_LANGS.filter(l => l.label.toLowerCase().includes(tgtSearch.toLowerCase()))
  const selectedSrc = LANGS.find(l => l.code === sourceLang)
  const selectedTgt = TARGET_LANGS.find(l => l.code === targetLang)

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null); setWarning(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('lang', targetLang)
      fd.append('sourceLang', sourceLang)
      const res = await fetch('/api/pdf/translate-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed') }
      const warn = res.headers.get('X-Translation-Warnings')
      if (warn) setWarning(warn.replace('partial:', '').split(':')[0] + ' — some pages could not be translated (API rate limit) and show original text.')
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="Translate PDF" description="Translate your PDF into 30+ languages" icon={Languages} color="bg-gradient-to-br from-cyan-600 to-blue-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select PDF to translate" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div className="grid grid-cols-2 gap-4">
            {/* Source language */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">From</label>
                {selectedSrc && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{selectedSrc.flag} {selectedSrc.label}</span>}
              </div>
              <input value={srcSearch} onChange={e => setSrcSearch(e.target.value)} placeholder="🔍 Search..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-xs mb-1.5 focus:outline-none focus:border-cyan-400" />
              <div className="max-h-36 overflow-y-auto border-2 border-gray-100 rounded-xl divide-y divide-gray-100">
                {filteredSrc.map(l => (
                  <button key={l.code} type="button" onClick={() => setSourceLang(l.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition ${sourceLang === l.code ? 'bg-cyan-50 text-cyan-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <span>{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target language */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">To</label>
                {selectedTgt && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">{selectedTgt.flag} {selectedTgt.label}</span>}
              </div>
              <input value={tgtSearch} onChange={e => setTgtSearch(e.target.value)} placeholder="🔍 Search..."
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-xs mb-1.5 focus:outline-none focus:border-cyan-400" />
              <div className="max-h-36 overflow-y-auto border-2 border-gray-100 rounded-xl divide-y divide-gray-100">
                {filteredTgt.map(l => (
                  <button key={l.code} type="button" onClick={() => setTargetLang(l.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition ${targetLang === l.code ? 'bg-cyan-50 text-cyan-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <span>{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
            🌐 Uses MyMemory free engine · 10,000 chars/day limit · Large PDFs may partially fall back to original text
          </div>

          {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Translating pages… this may take a moment.</p>}

          {warning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{warning}</p>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download={`translated_${targetLang}.pdf`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Translated PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Translating...</> : <><Languages className="w-5 h-5" /> Translate → {selectedTgt?.label}</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
