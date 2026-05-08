'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NDADocument from './NDADocument'
import GenericDocumentPreview from './GenericDocumentPreview'
import { DOC_STORAGE_KEY, DOC_TYPE_NAMES, mergeNDAFields, type DocStoragePayload } from '@/lib/types'

export default function PreviewPageClient() {
  const router = useRouter()
  const [payload, setPayload] = useState<DocStoragePayload | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(DOC_STORAGE_KEY)
    if (!stored) {
      router.replace('/')
      return
    }
    try {
      setPayload(JSON.parse(stored) as DocStoragePayload)
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading document...</p>
      </div>
    )
  }

  const { documentType, fields } = payload
  const docName = DOC_TYPE_NAMES[documentType] ?? 'Legal Document'

  const documentContent =
    documentType === 'mutual_nda' ? (
      <NDADocument data={mergeNDAFields(fields)} />
    ) : (
      <GenericDocumentPreview fields={fields} />
    )

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
              ← Back to chat
            </button>
            <span className="text-gray-300 select-none">|</span>
            <span className="text-sm font-medium text-gray-700">{docName} Preview</span>
          </div>
          <button
            onClick={() => window.print()}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer hover:opacity-90"
            style={{ backgroundColor: '#753991' }}
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Disclaimer – hidden when printing */}
      <div className="no-print max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800">
          <strong>Draft document</strong> — AI-generated and has not been reviewed by legal counsel. It should not be relied upon as legal advice.
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto my-4 px-4">
        <div className="bg-white shadow-sm rounded-lg p-12 print-document">
          {documentContent}
        </div>
      </div>
    </div>
  )
}
