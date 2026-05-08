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

export const NDA_STORAGE_KEY = 'prelegal_nda_data'
export const CHAT_SESSION_KEY = 'prelegal_chat_session'

export type PartialNDAData = Partial<NDAData>

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

export function mergeNDAFields(fields: PartialNDAData): NDAData {
  const filtered = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  )
  const merged = { ...NDA_DEFAULTS, ...filtered } as NDAData
  if (!merged.effectiveDate) merged.effectiveDate = new Date().toISOString().split('T')[0]
  return merged
}
