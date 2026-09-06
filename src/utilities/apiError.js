// Normalises the two error shapes the API returns:
//   application error -> { "error": "stable_code", "detail": "Human message" }
//   validation error  -> { "field_name": ["Message."] } / { "non_field_errors": [...] }
// Branch on `code`, never on the message text.

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  RATE_LIMITED: 'rate_limited',
  TOKEN_NOT_VALID: 'token_not_valid',
  WRONG_OLD_PASSWORD: 'wrong_old_password',
  SESSION_EXPIRED: 'session_expired',
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
}

// Fallbacks only — the server's own `detail` wins whenever it sends one.
const CODE_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Phone, role, or password is incorrect.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many attempts. Please try again in a few minutes.',
  [ERROR_CODES.TOKEN_NOT_VALID]: 'Your session has expired. Please sign in again.',
  [ERROR_CODES.WRONG_OLD_PASSWORD]: 'Current password is incorrect.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ERROR_CODES.NETWORK_ERROR]: 'Cannot reach the server. Check your connection and try again.',
  [ERROR_CODES.TIMEOUT]: 'The server took too long to respond. Please try again.',
}

// Only statuses whose meaning is unambiguous without a body. 401 is deliberately
// absent: it covers both bad credentials and an invalid/expired token, and only
// the `error` field in the body can tell those apart.
const STATUS_CODES = {
  429: ERROR_CODES.RATE_LIMITED,
}

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]'

const firstMessage = (value) => {
  if (Array.isArray(value)) return value.length ? firstMessage(value[0]) : null
  if (typeof value === 'string') return value
  return null
}

/**
 * @returns {{ status: number|null, code: string|null, message: string, fieldErrors: Record<string,string> }}
 */
export const parseApiError = (error, fallbackMessage = 'Something went wrong. Please try again.') => {
  const result = { status: null, code: null, message: fallbackMessage, fieldErrors: {} }
  if (!error) return result

  // Thrown by Apiservice when a refresh fails — there is no HTTP response.
  if (error.message === ERROR_CODES.SESSION_EXPIRED) {
    return { ...result, code: ERROR_CODES.SESSION_EXPIRED, message: CODE_MESSAGES[ERROR_CODES.SESSION_EXPIRED] }
  }

  const response = error.response
  if (!response) {
    const code = error.code === 'ECONNABORTED' ? ERROR_CODES.TIMEOUT : ERROR_CODES.NETWORK_ERROR
    return { ...result, code, message: CODE_MESSAGES[code] }
  }

  result.status = response.status ?? null

  const data = response.data
  if (typeof data === 'string' && data.trim()) result.message = data.trim()

  if (isPlainObject(data)) {
    if (typeof data.error === 'string') {
      // Application error shape.
      result.code = data.error
      result.message = data.detail || CODE_MESSAGES[data.error] || fallbackMessage
    } else {
      // Validation shape: every array-valued key is a field error.
      Object.entries(data).forEach(([key, value]) => {
        const message = firstMessage(value)
        if (message && key !== 'detail') result.fieldErrors[key] = message
      })

      const nonField = result.fieldErrors.non_field_errors
      delete result.fieldErrors.non_field_errors

      result.message =
        (typeof data.detail === 'string' && data.detail) ||
        nonField ||
        firstMessage(Object.values(result.fieldErrors)) ||
        fallbackMessage
    }
  }

  // Nothing usable in the body — fall back to what the status alone tells us.
  if (!result.code) {
    const statusCode = STATUS_CODES[result.status]
    if (statusCode) {
      result.code = statusCode
      if (result.message === fallbackMessage) result.message = CODE_MESSAGES[statusCode]
    }
  }

  return result
}

/** Maps parsed field errors onto antd Form fields; renames per `fieldMap`. */
export const toFormFields = (fieldErrors = {}, fieldMap = {}) =>
  Object.entries(fieldErrors).map(([name, message]) => ({
    name: fieldMap[name] || name,
    errors: [message],
  }))
