// In dev, leave the base URL empty so requests go through the Vite proxy
// (see server.proxy in vite.config.js) — this avoids CORS issues with the
// browser blocking cross-origin requests to the backend.
// In production, use the configured backend URL.
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.YT_API_BASE_URL || 'https://yantratech-backend.onrender.com')

export const API_TIMEOUT = Number(import.meta.env.YT_API_TIMEOUT) || 30000
