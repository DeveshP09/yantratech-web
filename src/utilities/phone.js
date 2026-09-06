// The API expects `phone` in E.164 with the country code, max 16 chars
// (e.g. +919999900000). The admin login form collects the 10-digit national
// number only, so normalise before every request that carries a phone.

export const DEFAULT_COUNTRY_CODE = '+91'
export const PHONE_MAX_LENGTH = 16
export const NATIONAL_NUMBER_LENGTH = 10

const digitsOf = (value) => String(value ?? '').replace(/\D/g, '')

export const toE164 = (
  input,
  { countryCode = DEFAULT_COUNTRY_CODE, nationalLength = NATIONAL_NUMBER_LENGTH } = {}
) => {
  const raw = String(input ?? '').trim()
  if (!raw) return ''

  const digits = digitsOf(raw)
  if (!digits) return ''

  // Already E.164 — keep the caller's country code as given.
  if (raw.startsWith('+')) return `+${digits}`

  const cc = digitsOf(countryCode)
  // Drop a national trunk prefix, e.g. 09999900000.
  const national = digits.replace(/^0+/, '')

  // Country code typed without the +, e.g. 919999900000. A bare national
  // number that merely starts with the same digits stays a national number.
  if (national.length > nationalLength && national.startsWith(cc)) return `+${national}`

  return `+${cc}${national}`
}

export const isValidE164 = (value) =>
  typeof value === 'string' &&
  value.length <= PHONE_MAX_LENGTH &&
  /^\+[1-9]\d{7,14}$/.test(value)

// +919999900000 -> 9999900000, for pre-filling the 10-digit input.
export const toNationalNumber = (value, { nationalLength = NATIONAL_NUMBER_LENGTH } = {}) => {
  const digits = digitsOf(value)
  return digits.length > nationalLength ? digits.slice(-nationalLength) : digits
}
