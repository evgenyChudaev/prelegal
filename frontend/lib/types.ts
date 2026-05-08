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
