import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'

export const Login = ({ onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccessMsg('')

    if (!validate()) return

    setLoading(true)
    try {
      const res = await login(formData.email, formData.password)
      setSuccessMsg('Login successful! Redirecting...')
      if (onSuccess) {
        onSuccess(res.user)
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl dark:shadow-2xl dark:shadow-black/80 backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 mx-auto mb-4">
          S
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">Sign in to access your dashboard and manage store ratings</p>
      </div>

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-1">
        <Input
          label="Email Address"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          required
          error={errors.email}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          error={errors.password}
        />

        <div className="pt-3">
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
        Don't have an account yet?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
        >
          Create an account
        </button>
      </div>
    </div>
  )
}

export default Login
