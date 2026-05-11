'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileIcon } from 'lucide-react'

interface FileUploadProps {
  onFiles: (files: File[]) => void
  accept?: Record<string, string[]>
  multiple?: boolean
  label?: string
}

export default function FileUpload({ onFiles, accept, multiple = false, label }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFiles(acceptedFiles)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, open } = useDropzone({
    onDrop,
    accept,
    multiple,
    noClick: false,   // allow clicking the root div
    noKeyboard: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition select-none
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}
    >
      {/* Hidden native file input — wired by react-dropzone */}
      <input {...getInputProps()} />

      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4 pointer-events-none" />

      {isDragActive ? (
        <p className="text-blue-600 font-semibold text-lg pointer-events-none">Drop files here…</p>
      ) : (
        <>
          <p className="text-gray-700 font-semibold text-lg mb-1 pointer-events-none">
            {label || 'Drag & drop files here'}
          </p>
          <p className="text-gray-400 text-sm mb-4 pointer-events-none">or click anywhere to browse</p>
          {/* type="button" prevents accidental form submission; onClick calls dropzone open() */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); open() }}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition font-medium"
          >
            Select {multiple ? 'Files' : 'File'}
          </button>
        </>
      )}

      {acceptedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {acceptedFiles.map((file) => (
            <div key={file.name} className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2 text-sm text-gray-700">
              <FileIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="text-gray-400 ml-auto flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
