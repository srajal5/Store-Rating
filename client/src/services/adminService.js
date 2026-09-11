import { getToken } from './authService'

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
  const response = await fetch('/api/admin/dashboard', {
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

  const response = await fetch(`/api/admin/users?${query.toString()}`, {
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

  const response = await fetch(`/api/admin/stores?${query.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch stores')
  }
  return data
}
