import { apiPost } from './Apiservice'
import { saveTokens, getRefreshToken, clearTokens } from './tokenStorage'

export const login = async ({ phone, role, password }) => {
  const data = await apiPost('/api/auth/login/', { phone, role, password }, false, false)
  if (data?.access && data?.refresh) {
    await saveTokens({ access: data.access, refresh: data.refresh })
  }
  return data
}

export const changePassword = async ({ old_password, new_password }) => {
  const data = await apiPost('/api/auth/change-password/', { old_password, new_password }, false, true)
  if (data?.access && data?.refresh) {
    await saveTokens({ access: data.access, refresh: data.refresh })
  }
  return data
}

export const logout = async () => {
  const refresh = await getRefreshToken()
  try {
    if (refresh) {
      await apiPost('/api/auth/logout/', { refresh }, false, false)
    }
  } catch (err) {
    console.warn('logout request failed:', err?.message || err)
  } finally {
    await clearTokens()
  }
}
