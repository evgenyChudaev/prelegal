'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NDAData } from '@/lib/types'
import { NDA_STORAGE_KEY } from '@/lib/types'

export default function NDAForm() {
  const router = useRouter()
  const [data, setData] = useState<NDAData>(() => ({
    purpose: 'Evaluating whether to enter into a business relationship with the other party.',
    effectiveDate: new Date().toISOString().split('T')[0],
    mndaTermType: 'expires',
    mndaTermYears: 1,
    confidentialityTermType: 'years',
    confidentialityTermYears: 1,
    governingLaw: '',
    jurisdiction: '',
    modifications: '',
    party1Name: '',
    party1Title: '',
    party1Company: '',
    party1Address: '',
    party2Name: '',
    party2Title: '',
    party2Company: '',
    party2Address: '',
  }))

  const setText =
    (key: keyof NDAData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [key]: e.target.value }))

  const setNum =
    (key: keyof NDAData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value)
      setData((prev) => ({ ...prev, [key]: n < 1 || isNaN(n) ? 1 : n }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(NDA_STORAGE_KEY, JSON.stringify(data))
    router.push('/preview')
  }

  const input =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const lbl = 'block text-sm font-medium text-gray-700 mb-1'
  const card = 'bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6'
  const cardTitle = 'text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Prelegal</h1>
          <p className="text-sm text-gray-500">Mutual NDA Creator</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Your Mutual NDA</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Fill in the details below to generate a Mutual Non-Disclosure Agreement.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Agreement Details */}
          <section className={card}>
            <h3 className={cardTitle}>Agreement Details</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="purpose" className={lbl}>
                  Purpose <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-1">How Confidential Information may be used</p>
                <textarea
                  id="purpose"
                  value={data.purpose}
                  onChange={setText('purpose')}
                  rows={3}
                  required
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="effectiveDate" className={lbl}>
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="effectiveDate"
                  type="date"
                  value={data.effectiveDate}
                  onChange={setText('effectiveDate')}
                  required
                  className={input}
                />
              </div>
            </div>
          </section>

          {/* Term Settings */}
          <section className={card}>
            <h3 className={cardTitle}>Term Settings</h3>
            <div className="space-y-6">
              <div>
                <p className={lbl}>MNDA Term</p>
                <p className="text-xs text-gray-500 mb-2">The length of this MNDA</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mndaTermType"
                      checked={data.mndaTermType === 'expires'}
                      onChange={() =>
                        setData((prev) => ({ ...prev, mndaTermType: 'expires' }))
                      }
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                      Expires after
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={data.mndaTermYears}
                        onChange={setNum('mndaTermYears')}
                        disabled={data.mndaTermType !== 'expires'}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      year(s) from Effective Date
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mndaTermType"
                      checked={data.mndaTermType === 'until-terminated'}
                      onChange={() =>
                        setData((prev) => ({ ...prev, mndaTermType: 'until-terminated' }))
                      }
                    />
                    <span className="text-sm text-gray-700">
                      Continues until terminated in accordance with the terms of the MNDA
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <p className={lbl}>Term of Confidentiality</p>
                <p className="text-xs text-gray-500 mb-2">How long Confidential Information is protected</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="confidentialityTermType"
                      checked={data.confidentialityTermType === 'years'}
                      onChange={() =>
                        setData((prev) => ({ ...prev, confidentialityTermType: 'years' }))
                      }
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={data.confidentialityTermYears}
                        onChange={setNum('confidentialityTermYears')}
                        disabled={data.confidentialityTermType !== 'years'}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      year(s) from Effective Date
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="confidentialityTermType"
                      checked={data.confidentialityTermType === 'perpetual'}
                      onChange={() =>
                        setData((prev) => ({ ...prev, confidentialityTermType: 'perpetual' }))
                      }
                    />
                    <span className="text-sm text-gray-700">In perpetuity</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className={card}>
            <h3 className={cardTitle}>Governing Law & Jurisdiction</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="governingLaw" className={lbl}>
                  Governing Law <span className="text-red-500">*</span>
                </label>
                <input
                  id="governingLaw"
                  type="text"
                  value={data.governingLaw}
                  onChange={setText('governingLaw')}
                  required
                  placeholder="e.g. Delaware"
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="jurisdiction" className={lbl}>
                  Jurisdiction <span className="text-red-500">*</span>
                </label>
                <input
                  id="jurisdiction"
                  type="text"
                  value={data.jurisdiction}
                  onChange={setText('jurisdiction')}
                  required
                  placeholder="e.g. courts located in New Castle, DE"
                  className={input}
                />
              </div>
            </div>
          </section>

          {/* Party Details */}
          <section className={card}>
            <h3 className={cardTitle}>Party Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <PartyFields
                idPrefix="party1"
                label="Party 1"
                nameVal={data.party1Name}
                titleVal={data.party1Title}
                companyVal={data.party1Company}
                addressVal={data.party1Address}
                onName={setText('party1Name')}
                onTitle={setText('party1Title')}
                onCompany={setText('party1Company')}
                onAddress={setText('party1Address')}
                inputClass={input}
              />
              <PartyFields
                idPrefix="party2"
                label="Party 2"
                nameVal={data.party2Name}
                titleVal={data.party2Title}
                companyVal={data.party2Company}
                addressVal={data.party2Address}
                onName={setText('party2Name')}
                onTitle={setText('party2Title')}
                onCompany={setText('party2Company')}
                onAddress={setText('party2Address')}
                inputClass={input}
              />
            </div>
          </section>

          {/* Modifications */}
          <section className={card}>
            <h3 className={cardTitle}>
              MNDA Modifications{' '}
              <span className="text-xs font-normal text-gray-400">(Optional)</span>
            </h3>
            <label htmlFor="modifications" className="sr-only">
              MNDA Modifications
            </label>
            <textarea
              id="modifications"
              value={data.modifications}
              onChange={setText('modifications')}
              rows={4}
              className={input}
              placeholder="List any modifications to the standard terms, or leave blank if none."
            />
          </section>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-base cursor-pointer"
          >
            Generate Document →
          </button>
        </form>
      </main>
    </div>
  )
}

const fieldLabel = 'block text-sm font-medium text-gray-700 mb-1'

function PartyFields({
  idPrefix,
  label: partyLabel,
  nameVal, titleVal, companyVal, addressVal,
  onName, onTitle, onCompany, onAddress,
  inputClass,
}: {
  idPrefix: string
  label: string
  nameVal: string
  titleVal: string
  companyVal: string
  addressVal: string
  onName: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTitle: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCompany: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddress: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  inputClass: string
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{partyLabel}</h4>
      <div className="space-y-3">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={fieldLabel}>
            Print Name <span className="text-red-500">*</span>
          </label>
          <input id={`${idPrefix}-name`} type="text" value={nameVal} onChange={onName} required className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-title`} className={fieldLabel}>
            Title <span className="text-red-500">*</span>
          </label>
          <input id={`${idPrefix}-title`} type="text" value={titleVal} onChange={onTitle} required className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-company`} className={fieldLabel}>
            Company <span className="text-red-500">*</span>
          </label>
          <input id={`${idPrefix}-company`} type="text" value={companyVal} onChange={onCompany} required className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-address`} className={fieldLabel}>
            Notice Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`${idPrefix}-address`}
            value={addressVal}
            onChange={onAddress}
            required
            rows={2}
            className={inputClass}
            placeholder="Email or postal address"
          />
        </div>
      </div>
    </div>
  )
}
