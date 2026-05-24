import { apiGet, apiPost } from './Apiservice'

export const getAttendance = (batchId, date) =>
  apiGet('/api/attendance/', { batch_id: batchId, date })

export const markAttendance = (payload) =>
  apiPost('/api/attendance/mark/', payload)
