import { getToken } from './authService'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const getHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

/**
 * Get dashboard stats for admin
 */
export const getAdminDashboardStats = async () => {
  const response = await fetch(`${API_BASE}/admin/dashboard`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch admin dashboard statistics')
  }
  return data.stats
}

/**
 * Get users list for admin with search, filter, sort, pagination
 * @param {Object} params - { search, role, sortBy, sortOrder, page, limit }
 */
export const getAdminUsers = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.role) query.append('role', params.role)
  if (params.sortBy) query.append('sortBy', params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page) query.append('page', params.page)
  if (params.limit) query.append('limit', params.limit)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`${API_BASE}/admin/users${queryString}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch users')
  }
  return data
}

/**
 * Get stores list for admin with search, filter, sort, pagination
 * @param {Object} params - { search, sortBy, sortOrder, page, limit }
 */
export const getAdminStores = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.sortBy) query.append('sortBy', params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page) query.append('page', params.page)
  if (params.limit) query.append('limit', params.limit)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`${API_BASE}/admin/stores${queryString}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch stores')
  }
  return data
}
