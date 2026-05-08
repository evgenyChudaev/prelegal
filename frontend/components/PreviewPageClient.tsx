'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NDADocument from './NDADocument'
import type { NDAData } from '@/lib/types'
import { NDA_STORAGE_KEY } from '@/lib/types'

export default function PreviewPageClient() {
  const router = useRouter()
  const [data, setData] = useState<NDAData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(NDA_STORAGE_KEY)
    if (!stored) {
      router.replace('/')
      return
    }
    try {
      setData(JSON.parse(stored) as NDAData)
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading document...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar – hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              ← Back to Form
            </button>
            <span className="text-gray-300 select-none">|</span>
            <span className="text-sm font-medium text-gray-700">Mutual NDA Preview</span>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto my-8 px-4">
        <div className="bg-white shadow-sm rounded-lg p-12 print-document">
          <NDADocument data={data} />
        </div>
      </div>
    </div>
  )
}
