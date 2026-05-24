import { LOCAL_STORAGE_KEYS } from '@/constant/appConstants'

const KEY = LOCAL_STORAGE_KEYS.AUTH_TOKEN

const getStored = () => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const getAccessToken = async () => getStored()?.access ?? null

export const getRefreshToken = async () => getStored()?.refresh ?? null

export const saveTokens = async ({ access, refresh }) => {
  localStorage.setItem(KEY, JSON.stringify({ access, refresh }))
}

export const clearTokens = async () => {
  localStorage.removeItem(KEY)
}
