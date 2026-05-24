import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/configs/environmentConfig'
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenStorage'

const REFRESH_URL = '/api/auth/refresh/'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

let onSessionExpired = null

export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = typeof handler === 'function' ? handler : null
}

const triggerSessionExpired = async () => {
  await clearTokens()
  if (onSessionExpired) {
    try {
      onSessionExpired()
    } catch (cbErr) {
      console.warn('onSessionExpired handler threw:', cbErr)
    }
  }
}

const EMAIL_KEY_REGEX = /email/i

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]'

const normalizeEmailFields = (value, parentKey = '') => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeEmailFields(item, parentKey))
  }
  if (isPlainObject(value)) {
    return Object.entries(value).reduce((acc, [key, item]) => {
      acc[key] = normalizeEmailFields(item, key)
      return acc
    }, {})
  }
  if (typeof value === 'string' && EMAIL_KEY_REGEX.test(parentKey)) {
    return value.trim().toLowerCase()
  }
  return value
}

const toFormData = (obj) => {
  const fd = new FormData()
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    if (value && typeof value === 'object' && typeof value.uri === 'string') {
      fd.append(key, value)
    } else if (typeof value === 'object') {
      fd.append(key, JSON.stringify(value))
    } else {
      fd.append(key, String(value))
    }
  })
  return fd
}

const buildConfig = ({ api_type, api_url, payload, query_params, is_form_data, accessToken }) => {
  const config = {
    method: api_type.toLowerCase(),
    url: `${API_BASE_URL}${api_url}`,
    timeout: API_TIMEOUT,
    headers: {},
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (payload) {
    if (is_form_data) {
      config.data = payload instanceof FormData ? payload : toFormData(payload)
      config.headers['Content-Type'] = 'multipart/form-data'
    } else {
      config.data = normalizeEmailFields(payload)
      config.headers['Content-Type'] = 'application/json'
    }
  }

  if (query_params) {
    config.params = normalizeEmailFields(query_params)
  }

  return config
}

const refreshTokens = async () => {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) throw new Error('no_refresh_token')

  const { data } = await axios({
    method: 'post',
    url: `${API_BASE_URL}${REFRESH_URL}`,
    timeout: API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
    data: { refresh: refreshToken },
  })

  if (!data?.access || !data?.refresh) throw new Error('invalid_refresh_response')

  await saveTokens({ access: data.access, refresh: data.refresh })
  return data.access
}

const apiService = async ({
  api_type = 'get',
  api_url,
  payload = null,
  query_params = null,
  is_form_data = false,
  is_auth = true,
}) => {
  let accessToken = null

  if (is_auth) {
    accessToken = await getAccessToken()
    if (!accessToken) throw new Error('Authentication required but no token available')
  }

  const config = buildConfig({ api_type, api_url, payload, query_params, is_form_data, accessToken })

  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    const status = error?.response?.status
    const isAuthEndpoint = api_url === REFRESH_URL

    if (status !== 401 || !is_auth || isAuthEndpoint) throw error

    if (isRefreshing) {
      const newToken = await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
      const retryConfig = {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${newToken}` },
      }
      return (await axios(retryConfig)).data
    }

    isRefreshing = true
    try {
      const newAccess = await refreshTokens()
      processQueue(null, newAccess)

      const retryConfig = {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${newAccess}` },
      }
      return (await axios(retryConfig)).data
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      await triggerSessionExpired()
      const sessionErr = new Error('session_expired')
      sessionErr.cause = refreshErr
      throw sessionErr
    } finally {
      isRefreshing = false
    }
  }
}

export const apiGet = (url, queryParams = null, isAuth = true) =>
  apiService({ api_type: 'get', api_url: url, query_params: queryParams, is_auth: isAuth })

export const apiPost = (url, payload = null, isFormData = false, isAuth = true) =>
  apiService({ api_type: 'post', api_url: url, payload, is_form_data: isFormData, is_auth: isAuth })

export const apiPut = (url, payload = null, isFormData = false, isAuth = true) =>
  apiService({ api_type: 'put', api_url: url, payload, is_form_data: isFormData, is_auth: isAuth })

export const apiPatch = (url, payload = null, isFormData = false, isAuth = true) =>
  apiService({ api_type: 'patch', api_url: url, payload, is_form_data: isFormData, is_auth: isAuth })

export const apiDelete = (url, payload = null, isAuth = true) =>
  apiService({ api_type: 'delete', api_url: url, payload, is_auth: isAuth })

export default apiService
