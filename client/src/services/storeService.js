import { getToken } from './authService'

const getHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

/**
 * Get all stores with search, sort, and pagination
 * @param {Object} params - { search, sortBy, sortOrder, page, limit }
 */
export const getStores = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.sortBy) query.append('sortBy', params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page) query.append('page', params.page)
  if (params.limit) query.append('limit', params.limit)

  const response = await fetch(`/api/stores?${query.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch stores list')
  }
  return data
}

/**
 * Get store details by ID
 */
export const getStoreById = async (id) => {
  const response = await fetch(`/api/stores/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch store details')
  }
  return data.store
}
