import { apiGet, apiPost } from './Apiservice'

export const getBatches = () =>
  apiGet('/api/batches/')

export const createBatch = (payload) =>
  apiPost('/api/batches/', payload)

export const getStudentsByBatch = (batchId) =>
  apiGet('/api/students/', { batch_id: batchId })

export const createStudent = (payload) =>
  apiPost('/api/students/', payload)
