// ─── NDA-specific types (kept for NDADocument renderer) ───────────────────────

export interface NDAData {
  purpose: string
  effectiveDate: string
  mndaTermType: 'expires' | 'until-terminated'
  mndaTermYears: number
  confidentialityTermType: 'years' | 'perpetual'
  confidentialityTermYears: number
  governingLaw: string
  jurisdiction: string
  modifications: string
  party1Name: string
  party1Title: string
  party1Company: string
  party1Address: string
  party2Name: string
  party2Title: string
  party2Company: string
  party2Address: string
}

export const NDA_DEFAULTS: NDAData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: '',
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
}

// ─── Universal document fields (all types) ────────────────────────────────────

export interface GenericDocFields {
  documentType?: string | null
  party1Name?: string | null
  party1Title?: string | null
  party1Company?: string | null
  party1Address?: string | null
  party2Name?: string | null
  party2Title?: string | null
  party2Company?: string | null
  party2Address?: string | null
  effectiveDate?: string | null
  governingLaw?: string | null
  jurisdiction?: string | null
  modifications?: string | null
  // NDA-specific
  purpose?: string | null
  mndaTermType?: 'expires' | 'until-terminated' | null
  mndaTermYears?: number | null
  confidentialityTermType?: 'years' | 'perpetual' | null
  confidentialityTermYears?: number | null
  // Shared service fields
  productOrServiceName?: string | null
  term?: string | null
  fees?: string | null
  // Type-specific
  subscriptionPeriod?: string | null
  paymentTerms?: string | null
  servicesDescription?: string | null
  deliverables?: string | null
  uptimeCommitment?: string | null
  responseTime?: string | null
  generalCapAmount?: string | null
  processingPurposes?: string | null
  dataTypes?: string | null
  retentionPeriod?: string | null
  licenseType?: string | null
  partnershipPurpose?: string | null
  revenueSharing?: string | null
  programDescription?: string | null
  evaluationPurposes?: string | null
}

// ─── Auth types ───────────────────────────────────────────────────────────────

export type User = {
  id: number
  email: string
}

// ─── Saved document types ─────────────────────────────────────────────────────

export type SavedDocument = {
  id: number
  documentType: string
  fields: GenericDocFields
  createdAt: string
  updatedAt: string
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const CHAT_SESSION_KEY = 'prelegal_chat_session'
export const DOC_STORAGE_KEY = 'prelegal_doc_data'
/** @deprecated Use DOC_STORAGE_KEY instead */
export const NDA_STORAGE_KEY = 'prelegal_nda_data'

// ─── Session / storage shapes ─────────────────────────────────────────────────

export type ChatSession = {
  messages: { role: 'user' | 'assistant'; content: string }[]
  fields: GenericDocFields
  complete: boolean
}

export type DocStoragePayload = {
  documentType: string
  fields: GenericDocFields
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function mergeNDAFields(fields: GenericDocFields): NDAData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { documentType, ...rest } = fields
  const filtered = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  )
  const merged = { ...NDA_DEFAULTS, ...filtered } as NDAData
  if (!merged.effectiveDate) merged.effectiveDate = new Date().toISOString().split('T')[0]
  return merged
}

// Document type display names (mirrors backend SUPPORTED_DOCS)
export const DOC_TYPE_NAMES: Record<string, string> = {
  mutual_nda: 'Mutual Non-Disclosure Agreement',
  cloud_service_agreement: 'Cloud Service Agreement',
  design_partner_agreement: 'Design Partner Agreement',
  service_level_agreement: 'Service Level Agreement',
  professional_services_agreement: 'Professional Services Agreement',
  data_processing_agreement: 'Data Processing Agreement',
  software_license_agreement: 'Software License Agreement',
  partnership_agreement: 'Partnership Agreement',
  pilot_agreement: 'Pilot Agreement',
  business_associate_agreement: 'Business Associate Agreement',
  ai_addendum: 'AI Addendum',
}

// Human-readable labels for each field (mirrors backend field_labels)
export const FIELD_LABELS: Record<string, string> = {
  party1Name: 'Party 1 Name',
  party1Title: 'Party 1 Title',
  party1Company: 'Party 1 Company',
  party1Address: 'Party 1 Address',
  party2Name: 'Party 2 Name',
  party2Title: 'Party 2 Title',
  party2Company: 'Party 2 Company',
  party2Address: 'Party 2 Address',
  effectiveDate: 'Effective Date',
  governingLaw: 'Governing Law',
  jurisdiction: 'Jurisdiction',
  modifications: 'Modifications',
  purpose: 'Purpose',
  mndaTermType: 'MNDA Term Type',
  mndaTermYears: 'MNDA Term (years)',
  confidentialityTermType: 'Confidentiality Term Type',
  confidentialityTermYears: 'Confidentiality Term (years)',
  productOrServiceName: 'Product / Service Name',
  term: 'Term',
  fees: 'Fees',
  subscriptionPeriod: 'Subscription Period',
  paymentTerms: 'Payment Terms',
  servicesDescription: 'Services Description',
  deliverables: 'Deliverables',
  uptimeCommitment: 'Uptime Commitment',
  responseTime: 'Response Time',
  generalCapAmount: 'Liability Cap Amount',
  processingPurposes: 'Processing Purposes',
  dataTypes: 'Data Types',
  retentionPeriod: 'Retention Period',
  licenseType: 'License Type',
  partnershipPurpose: 'Partnership Purpose',
  revenueSharing: 'Revenue Sharing',
  programDescription: 'Program Description',
  evaluationPurposes: 'Evaluation Purposes',
}
