import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser as apiGetCurrentUser,
  logout as apiLogout,
  getToken,
} from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      if (token) {
        try {
          const currentUser = await apiGetCurrentUser()
          setUser(currentUser)
        } catch (err) {
          console.error('Failed to restore session:', err.message)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    setError(null)
    try {
      const data = await apiLogin(email, password)
      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const register = async (userData) => {
    setError(null)
    try {
      const data = await apiRegister(userData)
      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setError(null)
  }

  const refreshUser = async () => {
    try {
      const currentUser = await apiGetCurrentUser()
      setUser(currentUser)
    } catch (err) {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
