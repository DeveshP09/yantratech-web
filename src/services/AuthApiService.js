import { apiPost } from './Apiservice'
import { saveTokens, getRefreshToken, clearTokens } from './tokenStorage'
import { toE164 } from '@/utilities/phone'

const LOGIN_URL = '/api/auth/login/'
const LOGOUT_URL = '/api/auth/logout/'
const CHANGE_PASSWORD_URL = '/api/auth/change-password/'

// Both /login/ and /change-password/ answer with { access, refresh, user }.
const persistTokenPair = async (data) => {
  if (data?.access && data?.refresh) {
    await saveTokens({ access: data.access, refresh: data.refresh })
  }
  return data
}

export const login = async ({ phone, role = 'admin', password }) => {
  // A failed login must not leave a previous session's tokens behind.
  await clearTokens()

  const data = await apiPost(
    LOGIN_URL,
    { phone: toE164(phone), role, password },
    false,
    false
  )
  return persistTokenPair(data)
}

export const changePassword = async ({ old_password, new_password }) => {
  const data = await apiPost(
    CHANGE_PASSWORD_URL,
    { old_password, new_password },
    false,
    true
  )
  return persistTokenPair(data)
}

export const logout = async () => {
  const refresh = await getRefreshToken()
  try {
    if (refresh) {
      await apiPost(LOGOUT_URL, { refresh }, false, false)
    }
  } catch (err) {
    // The refresh token may already be blacklisted — clear locally regardless.
    console.warn('logout request failed:', err?.message || err)
  } finally {
    await clearTokens()
  }
}
