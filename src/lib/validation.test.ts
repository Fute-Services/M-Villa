import { describe, expect, it } from 'vitest'
import { emptyEnquiry, isDirty, validateEnquiry } from './validation'

const valid = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  phone: '+971 50 123 4567',
  unitType: '3bhk',
  message: '',
}

describe('validateEnquiry', () => {
  it('accepts a complete, valid enquiry', () => {
    expect(validateEnquiry(valid)).toEqual({})
  })

  it('reports every missing required field', () => {
    expect(Object.keys(validateEnquiry(emptyEnquiry)).sort()).toEqual(['email', 'name', 'phone', 'unitType'])
  })

  it('rejects malformed email and phone', () => {
    const errors = validateEnquiry({ ...valid, email: 'not-an-email', phone: 'abc' })
    expect(errors.email).toBeTruthy()
    expect(errors.phone).toBeTruthy()
  })

  it('rejects over-long messages', () => {
    expect(validateEnquiry({ ...valid, message: 'x'.repeat(301) }).message).toBeTruthy()
  })
})

describe('isDirty', () => {
  it('is false for an empty form and true once anything is typed', () => {
    expect(isDirty(emptyEnquiry)).toBe(false)
    expect(isDirty({ ...emptyEnquiry, name: 'A' })).toBe(true)
  })
})
