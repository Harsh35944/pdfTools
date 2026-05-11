'use client'
import { ReactNode } from 'react'
import { X, FileText, Image as ImageIcon } from 'lucide-react'

interface FileCardProps {
  file: File
  onRemove: () => void
  preview?: string | null
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 ** 2).toFixed(2) + ' MB'
}

export default function FileCard({ file, onRemove, preview }: FileCardProps) {
  const isPdf = file.type === 'application/pdf'
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
      {preview ? (
        <img src={preview} alt="preview" className="w-10 h-10 rounded object-cover flex-shrink-0" />
      ) : (
        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-100' : 'bg-blue-100'}`}>
          {isPdf ? <FileText className="w-5 h-5 text-red-500" /> : <ImageIcon className="w-5 h-5 text-blue-500" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
      </div>
      <button type="button" onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
