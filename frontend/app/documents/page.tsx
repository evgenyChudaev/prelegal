'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DOC_STORAGE_KEY, DOC_TYPE_NAMES, type SavedDocument, type User } from '@/lib/types'

export default function DocumentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [docs, setDocs] = useState<SavedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { user: User | null }) => {
        if (!data.user) { router.replace('/auth'); return }
        setUser(data.user)
        return fetch('/api/documents')
      })
      .then((r) => (r ? r.json() : null))
      .then((data: SavedDocument[] | null) => { if (data) setDocs(data) })
      .catch(() => router.replace('/auth'))
      .finally(() => setLoading(false))
  }, [router])

  const openDoc = (doc: SavedDocument) => {
    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify({ documentType: doc.documentType, fields: doc.fields }))
    router.push('/preview')
  }

  const deleteDoc = async (id: number) => {
    setDeletingId(id)
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocs((prev) => prev.filter((d) => d.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso + 'Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return iso
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-xl font-bold cursor-pointer"
            style={{ color: 'var(--brand-navy)' }}
          >
            Prelegal
          </button>
          <span className="text-gray-300 select-none">|</span>
          <span className="text-sm font-medium text-gray-600">My Documents</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer text-white"
            style={{ backgroundColor: 'var(--brand-blue)' }}
          >
            + New Document
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {docs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-14 h-14 border-2 border-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-sm">No documents yet. Start a chat to create one.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-sm font-medium px-4 py-2 rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: 'var(--brand-purple)' }}
            >
              Create your first document
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    {doc.documentType.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--brand-navy)' }}>
                    {DOC_TYPE_NAMES[doc.documentType] ?? doc.documentType}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Created {formatDate(doc.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => openDoc(doc)}
                    className="flex-1 text-sm font-medium py-1.5 rounded-lg text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--brand-blue)' }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    disabled={deletingId === doc.id}
                    className="text-sm font-medium py-1.5 px-3 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === doc.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
