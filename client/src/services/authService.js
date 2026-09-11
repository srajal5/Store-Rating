const TOKEN_KEY = 'store_rating_jwt'
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * Login user
 * @param {string} email
 * @param {string} password
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Login failed')
  }

  if (data.token) {
    setToken(data.token)
  }

  return data
}

/**
 * Register new user
 * @param {Object} userData - { name, email, password, address }
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Registration failed')
  }

  if (data.token) {
    setToken(data.token)
  }

  return data
}

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const token = getToken()

  if (!token) {
    return null
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    removeToken()
    throw new Error(data.message || 'Session expired')
  }

  return data.user
}

/**
 * Change password for logged in user
 */
export const changePassword = async (oldPassword, newPassword) => {
  const token = getToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to change password')
  }

  return data
}

/**
 * Logout
 */
export const logout = () => {
  removeToken()
}
