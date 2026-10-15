export interface EnquiryValues {
  name: string
  email: string
  phone: string
  unitType: string
  message: string
}

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>

export const emptyEnquiry: EnquiryValues = { name: '', email: '', phone: '', unitType: '', message: '' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9][0-9\s-]{6,16}[0-9]$/

export function validateEnquiry(v: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {}
  if (v.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).'
  if (!EMAIL.test(v.email.trim())) errors.email = 'Enter a valid email address.'
  if (!PHONE.test(v.phone.trim())) errors.phone = 'Enter a valid phone number, e.g. +971 50 123 4567.'
  if (!v.unitType) errors.unitType = 'Choose a unit type.'
  if (v.message.length > 300) errors.message = 'Keep the message under 300 characters.'
  return errors
}

export const isDirty = (v: EnquiryValues) => Object.values(v).some((x) => x.trim() !== '')
