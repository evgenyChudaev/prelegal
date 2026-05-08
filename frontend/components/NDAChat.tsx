'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NDADocument from './NDADocument'
import {
  CHAT_SESSION_KEY,
  NDA_STORAGE_KEY,
  mergeNDAFields,
  type PartialNDAData,
} from '@/lib/types'

type Message = { role: 'user' | 'assistant'; content: string }

type SessionState = {
  messages: Message[]
  fields: PartialNDAData
  complete: boolean
}

export default function NDAChat() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [fields, setFields] = useState<PartialNDAData>({})
  const [complete, setComplete] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  // Restore session or fetch greeting on mount.
  useEffect(() => {
    const saved = sessionStorage.getItem(CHAT_SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SessionState
        if (parsed.messages?.length) {
          setMessages(parsed.messages)
          setFields(parsed.fields ?? {})
          setComplete(!!parsed.complete)
          setHydrated(true)
          return
        }
      } catch {
        /* fall through to fetch */
      }
    }

    fetch('/api/chat/greeting')
      .then(async (r) => {
        if (!r.ok) throw new Error('greeting failed')
        const data = await r.json()
        setMessages([{ role: 'assistant', content: data.reply }])
        setFields(data.fields ?? {})
      })
      .catch(() => setError('Could not load greeting. Is the chat service running?'))
      .finally(() => setHydrated(true))
  }, [])

  // Persist to sessionStorage so navigating to /preview and back keeps state.
  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(
      CHAT_SESSION_KEY,
      JSON.stringify({ messages, fields, complete } satisfies SessionState),
    )
  }, [hydrated, messages, fields, complete])

  // Scroll chat to bottom when messages change.
  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setSending(true)
    setError(null)
    try {
      const r = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, fields }),
      })
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { detail?: string }
        setError(typeof body.detail === 'string' ? body.detail : 'Request failed')
        return
      }
      const data = (await r.json()) as { reply: string; fields: PartialNDAData; complete: boolean }
      setMessages([...next, { role: 'assistant', content: data.reply }])
      setFields(data.fields ?? {})
      setComplete(!!data.complete)
    } catch {
      setError('Could not connect to the chat service.')
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const downloadPDF = () => {
    const merged = mergeNDAFields(fields)
    localStorage.setItem(NDA_STORAGE_KEY, JSON.stringify(merged))
    router.push('/preview')
  }

  const newDocument = () => {
    sessionStorage.removeItem(CHAT_SESSION_KEY)
    setMessages([])
    setFields({})
    setComplete(false)
    setError(null)
    setHydrated(false)
    fetch('/api/chat/greeting')
      .then(async (r) => {
        if (!r.ok) throw new Error('greeting failed')
        const data = await r.json()
        setMessages([{ role: 'assistant', content: data.reply }])
        setFields(data.fields ?? {})
      })
      .catch(() => setError('Could not load greeting. Is the chat service running?'))
      .finally(() => setHydrated(true))
  }

  const previewData = mergeNDAFields(fields)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prelegal</h1>
          <p className="text-sm text-gray-500">Mutual NDA Creator</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={newDocument}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md cursor-pointer"
          >
            New document
          </button>
          <button
            type="button"
            onClick={downloadPDF}
            disabled={!complete}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            title={complete ? 'Open print preview' : 'Provide all required details first'}
          >
            Download PDF
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-7xl mx-auto w-full min-h-0">
        <section className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm h-[calc(100vh-8.5rem)]">
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap'
                      : 'bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 text-sm italic">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="border-t border-red-100 bg-red-50 text-red-700 px-4 py-2 text-xs">
              {error}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="border-t border-gray-200 p-3 flex gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={2}
              placeholder="Type your message and press Enter…"
              disabled={sending || !hydrated}
              autoFocus
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim() || !hydrated}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 rounded-md cursor-pointer"
            >
              Send
            </button>
          </form>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm h-[calc(100vh-8.5rem)] overflow-y-auto p-6">
          <NDADocument data={previewData} />
        </section>
      </main>
    </div>
  )
}
