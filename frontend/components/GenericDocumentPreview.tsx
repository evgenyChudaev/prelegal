import type { GenericDocFields } from '@/lib/types'
import { DOC_TYPE_NAMES, FIELD_LABELS } from '@/lib/types'

const PARTY_FIELDS: Array<keyof GenericDocFields> = [
  'party1Name', 'party1Title', 'party1Company', 'party1Address',
]
const PARTY2_FIELDS: Array<keyof GenericDocFields> = [
  'party2Name', 'party2Title', 'party2Company', 'party2Address',
]
const SKIP_IN_TERMS: Set<keyof GenericDocFields> = new Set([
  'documentType',
  'party1Name', 'party1Title', 'party1Company', 'party1Address',
  'party2Name', 'party2Title', 'party2Company', 'party2Address',
  'mndaTermType', 'mndaTermYears', 'confidentialityTermType', 'confidentialityTermYears',
])

// Per-type role labels for party 1 and 2
const PARTY_ROLES: Record<string, [string, string]> = {
  mutual_nda: ['Party 1', 'Party 2'],
  cloud_service_agreement: ['Provider', 'Customer'],
  design_partner_agreement: ['Provider', 'Partner'],
  service_level_agreement: ['Provider', 'Customer'],
  professional_services_agreement: ['Provider', 'Customer'],
  data_processing_agreement: ['Processor', 'Controller'],
  software_license_agreement: ['Licensor', 'Licensee'],
  partnership_agreement: ['Party 1', 'Party 2'],
  pilot_agreement: ['Provider', 'Customer'],
  business_associate_agreement: ['Covered Entity', 'Business Associate'],
  ai_addendum: ['Provider', 'Customer'],
}

function PartyCard({
  role,
  name,
  title,
  company,
  address,
}: {
  role: string
  name?: string | null
  title?: string | null
  company?: string | null
  address?: string | null
}) {
  const hasData = name || company || address
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{role}</div>
      {hasData ? (
        <div className="space-y-0.5 text-sm text-gray-900">
          {name && <div className="font-semibold">{name}</div>}
          {title && <div className="text-gray-600">{title}</div>}
          {company && <div>{company}</div>}
          {address && <div className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{address}</div>}
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">Not yet provided</div>
      )}
    </div>
  )
}

function TermRow({ label, value }: { label: string; value?: string | null | number }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 shrink-0 w-40">{label}</span>
      {value != null && value !== '' ? (
        <span className="text-gray-900 whitespace-pre-wrap">{String(value)}</span>
      ) : (
        <span className="text-gray-400 italic">—</span>
      )}
    </div>
  )
}

export default function GenericDocumentPreview({
  fields,
}: {
  fields: GenericDocFields
}) {
  const docType = fields.documentType ?? ''
  const docName = DOC_TYPE_NAMES[docType] ?? 'Legal Agreement'
  const [party1Role, party2Role] = PARTY_ROLES[docType] ?? ['Party 1', 'Party 2']

  // Gather term rows: all fields that aren't party-specific or doc-type meta
  const termRows = (Object.keys(FIELD_LABELS) as Array<keyof GenericDocFields>).filter(
    (k) => !SKIP_IN_TERMS.has(k) && fields[k] != null && fields[k] !== '',
  )

  return (
    <div className="font-sans text-gray-900">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-5 text-xs text-amber-800">
        <strong>Draft document</strong> — AI-generated and not reviewed by legal counsel. Not legal advice.
      </div>
      <h1 className="text-xl font-bold mb-1" style={{ color: '#032147' }}>
        {docName}
      </h1>
      <p className="text-xs text-gray-500 mb-6">
        Common Paper · Standard terms apply · Fill in the details via chat
      </p>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <PartyCard
          role={party1Role}
          name={fields.party1Name}
          title={fields.party1Title}
          company={fields.party1Company}
          address={fields.party1Address}
        />
        <PartyCard
          role={party2Role}
          name={fields.party2Name}
          title={fields.party2Title}
          company={fields.party2Company}
          address={fields.party2Address}
        />
      </div>

      {/* Key terms */}
      {termRows.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Key Terms
          </div>
          {termRows.map((k) => (
            <TermRow key={k} label={FIELD_LABELS[k] ?? k} value={fields[k] as string | null} />
          ))}
        </div>
      )}

      {termRows.length === 0 && !fields.party1Name && !fields.party2Name && (
        <div className="text-center py-12 text-gray-400 text-sm">
          <div className="w-12 h-12 border-2 border-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <div>Your document preview will appear here as you fill in the details.</div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Common Paper standard terms apply · Free to use under CC BY 4.0
      </p>
    </div>
  )
}
