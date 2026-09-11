import { getToken } from './authService'

const getHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

/**
 * Get dashboard overview data for authenticated STORE_OWNER
 */
export const getOwnerDashboard = async () => {
  const response = await fetch('/api/owner/dashboard', {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch store owner dashboard')
  }
  return data
}

/**
 * Get paginated ratings list for authenticated STORE_OWNER's store
 * @param {Object} params - { search, rating, sortBy, sortOrder, page, limit }
 */
export const getOwnerRatings = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.rating) query.append('rating', params.rating)
  if (params.sortBy) query.append('sortBy', params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.page) query.append('page', params.page)
  if (params.limit) query.append('limit', params.limit)

  const response = await fetch(`/api/owner/ratings?${query.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch store ratings')
  }
  return data
}
