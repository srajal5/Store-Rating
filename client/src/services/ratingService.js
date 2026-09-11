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
 * Submit a new rating for a store
 * @param {number} store_id
 * @param {number} rating (1-5)
 */
export const submitRating = async (store_id, rating) => {
  const response = await fetch(`${API_BASE}/ratings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ store_id, rating }),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit rating')
  }
  return data
}

/**
 * Modify an existing rating
 * @param {number} rating_id
 * @param {number} rating (1-5)
 */
export const updateRating = async (rating_id, rating) => {
  const response = await fetch(`${API_BASE}/ratings/${rating_id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ rating }),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update rating')
  }
  return data
}

/**
 * Delete a rating
 * @param {number} rating_id
 */
export const deleteRating = async (rating_id) => {
  const response = await fetch(`${API_BASE}/ratings/${rating_id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete rating')
  }
  return data
}

/**
 * Get all ratings for a store including user's own rating
 * @param {number} storeId
 */
export const getStoreRatings = async (storeId) => {
  const response = await fetch(`${API_BASE}/ratings/${storeId}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch store ratings')
  }
  return data
}
