import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
            <FileText className="w-5 h-5 text-red-500" />
            PDFTools
          </div>
          <p className="text-sm">Free online PDF & Image tools. Fast, secure and easy to use.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">PDF Tools</h4>
          <ul className="space-y-2 text-sm">
            {[['Merge PDF', '/tools/merge-pdf'], ['Split PDF', '/tools/split-pdf'],
              ['Compress PDF', '/tools/compress-pdf'], ['PDF to JPG', '/tools/pdf-to-jpg'],
              ['JPG to PDF', '/tools/jpg-to-pdf']].map(([n, h]) => (
              <li key={h}><Link href={h} className="hover:text-white transition">{n}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Image Tools</h4>
          <ul className="space-y-2 text-sm">
            {[['Crop Image', '/tools/crop-image'], ['Compress Image', '/tools/compress-image'],
              ['Resize Image', '/tools/resize-image'], ['Convert Image', '/tools/convert-image'],
              ['Remove Background', '/tools/remove-bg']].map(([n, h]) => (
              <li key={h}><Link href={h} className="hover:text-white transition">{n}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-sm">
        © {new Date().getFullYear()} PDFTools. All rights reserved.
      </div>
    </footer>
  )
}
