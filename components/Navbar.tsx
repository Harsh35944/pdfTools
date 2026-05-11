'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, FileText, Image } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-red-600">
          <FileText className="w-6 h-6" />
          PDFTools
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 font-medium">
              <FileText className="w-4 h-4" /> PDF Tools
            </button>
            <div className="absolute top-8 left-0 w-48 bg-white shadow-xl rounded-xl p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto border border-gray-100">
              {[
                ['Merge PDF', '/tools/merge-pdf'],
                ['Split PDF', '/tools/split-pdf'],
                ['Compress PDF', '/tools/compress-pdf'],
                ['JPG to PDF', '/tools/jpg-to-pdf'],
                ['PDF to JPG', '/tools/pdf-to-jpg'],
                ['Protect PDF', '/tools/protect-pdf'],
                ['Watermark PDF', '/tools/watermark-pdf'],
              ].map(([name, href]) => (
                <Link key={href} href={href} className="block px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg">
                  {name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 font-medium">
              <Image className="w-4 h-4" /> Image Tools
            </button>
            <div className="absolute top-8 left-0 w-48 bg-white shadow-xl rounded-xl p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto border border-gray-100">
              {[
                ['Crop Image', '/tools/crop-image'],
                ['Compress Image', '/tools/compress-image'],
                ['Resize Image', '/tools/resize-image'],
                ['Convert Image', '/tools/convert-image'],
                ['Rotate Image', '/tools/rotate-image'],
                ['Remove Background', '/tools/remove-bg'],
              ].map(([name, href]) => (
                <Link key={href} href={href} className="block px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg">
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-gray-600">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {[
            ['Merge PDF', '/tools/merge-pdf'],
            ['Split PDF', '/tools/split-pdf'],
            ['Compress PDF', '/tools/compress-pdf'],
            ['Compress Image', '/tools/compress-image'],
            ['Resize Image', '/tools/resize-image'],
            ['Convert Image', '/tools/convert-image'],
          ].map(([name, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block py-2 text-gray-700 hover:text-red-600 font-medium">
              {name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
