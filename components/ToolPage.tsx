'use client'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface ToolPageProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  children: ReactNode
}

export default function ToolPage({ title, description, icon: Icon, color, children }: ToolPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`${color} text-white py-12 px-4 text-center`}>
        <div className="max-w-2xl mx-auto">
          <Icon className="w-14 h-14 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
          <p className="text-white/80 text-lg">{description}</p>
        </div>
      </div>

      {/* Tool Area */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  )
}
