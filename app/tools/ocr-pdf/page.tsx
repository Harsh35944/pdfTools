'use client'
import { useState } from 'react'
import { ScanText, Download, Loader2 } from 'lucide-react'
import ToolPage from '@/components/ToolPage'
import FileUpload from '@/components/FileUpload'
import FileCard from '@/components/FileCard'

const LANGUAGES = [
  { code: 'eng', flag: '🇬🇧', label: 'English' }, { code: 'fra', flag: '🇫🇷', label: 'French' },
  { code: 'deu', flag: '🇩🇪', label: 'German' }, { code: 'spa', flag: '🇪🇸', label: 'Spanish' },
  { code: 'ita', flag: '🇮🇹', label: 'Italian' }, { code: 'por', flag: '🇵🇹', label: 'Portuguese' },
  { code: 'rus', flag: '🇷🇺', label: 'Russian' }, { code: 'chi_sim', flag: '🇨🇳', label: 'Chinese (Sim.)' },
  { code: 'chi_tra', flag: '🇹🇼', label: 'Chinese (Trad.)' }, { code: 'jpn', flag: '🇯🇵', label: 'Japanese' },
  { code: 'kor', flag: '🇰🇷', label: 'Korean' }, { code: 'ara', flag: '🇸🇦', label: 'Arabic' },
  { code: 'hin', flag: '🇮🇳', label: 'Hindi' }, { code: 'tur', flag: '🇹🇷', label: 'Turkish' },
  { code: 'pol', flag: '🇵🇱', label: 'Polish' }, { code: 'nld', flag: '🇳🇱', label: 'Dutch' },
  { code: 'swe', flag: '🇸🇪', label: 'Swedish' }, { code: 'nor', flag: '🇳🇴', label: 'Norwegian' },
  { code: 'dan', flag: '🇩🇰', label: 'Danish' }, { code: 'fin', flag: '🇫🇮', label: 'Finnish' },
  { code: 'ukr', flag: '🇺🇦', label: 'Ukrainian' }, { code: 'vie', flag: '🇻🇳', label: 'Vietnamese' },
  { code: 'tha', flag: '🇹🇭', label: 'Thai' }, { code: 'ind', flag: '🇮🇩', label: 'Indonesian' },
  { code: 'heb', flag: '🇮🇱', label: 'Hebrew' }, { code: 'ell', flag: '🇬🇷', label: 'Greek' },
  { code: 'ces', flag: '🇨🇿', label: 'Czech' }, { code: 'hun', flag: '🇭🇺', label: 'Hungarian' },
  { code: 'ben', flag: '🇧🇩', label: 'Bengali' }, { code: 'tam', flag: '🇮🇳', label: 'Tamil' },
  { code: 'tel', flag: '🇮🇳', label: 'Telugu' }, { code: 'urd', flag: '🇵🇰', label: 'Urdu' },
]

export default function OcrPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [lang, setLang] = useState('eng')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setFile(null); setDownloadUrl(null); setError(null) }
  const onFiles = (files: File[]) => { setFile(files[0]); setDownloadUrl(null); setError(null) }
  const filtered = LANGUAGES.filter(l => l.label.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search.toLowerCase()))
  const selectedLang = LANGUAGES.find(l => l.code === lang)

  const handle = async () => {
    if (!file) return
    setLoading(true); setError(null); setDownloadUrl(null)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('lang', lang)
      const res = await fetch('/api/pdf/ocr-pdf', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed') }
      setDownloadUrl(URL.createObjectURL(await res.blob()))
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <ToolPage title="OCR PDF" description="Make scanned PDFs fully searchable and selectable" icon={ScanText} color="bg-gradient-to-br from-rose-500 to-rose-700">
      {!file ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <FileUpload onFiles={onFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={false} label="Select scanned PDF here" />
          <div className="grid grid-cols-3 gap-3">
            {[['🖼️', 'Render pages', 'Converts to image'], ['🔍', 'OCR scan', '50+ languages'], ['📄', 'Layer text', 'Invisible searchable layer']].map(([e, t, d]) => (
              <div key={t} className="bg-rose-50 rounded-xl p-3 text-center">
                <p className="text-2xl">{e}</p>
                <p className="text-xs font-semibold text-rose-700 mt-1">{t}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <FileCard file={file} onRemove={reset} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Document Language</label>
              {selectedLang && <span className="text-sm bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-medium">{selectedLang.flag} {selectedLang.label}</span>}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search language..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-2 focus:outline-none focus:border-rose-400 transition" />
            <div className="max-h-48 overflow-y-auto border-2 border-gray-100 rounded-xl divide-y divide-gray-100">
              {filtered.map(l => (
                <button key={l.code} type="button" onClick={() => setLang(l.code)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition ${lang === l.code ? 'bg-rose-50 text-rose-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <span>{l.flag}</span>{l.label}
                </button>
              ))}
              {filtered.length === 0 && <p className="text-center text-sm text-gray-400 p-4">No language found</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
            ⏱️ Processing time: ~1–3 min per page depending on language complexity.
          </div>

          {loading && <p className="text-sm text-center text-gray-500 animate-pulse">Running OCR… please wait.</p>}
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {downloadUrl ? (
            <a href={downloadUrl} download="ocr.pdf"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg block text-center">
              <Download className="w-5 h-5" /> Download Searchable PDF
            </a>
          ) : (
            <button onClick={handle} disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Running OCR...</> : <><ScanText className="w-5 h-5" /> Run OCR</>}
            </button>
          )}
        </div>
      )}
    </ToolPage>
  )
}
