import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Alert from '../components/common/Alert'

export const Register = ({ onSwitchToLogin, onSuccess }) => {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
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

  // Live password complexity checks
  const passLength = formData.password.length >= 8 && formData.password.length <= 16
  const passUpper = /[A-Z]/.test(formData.password)
  const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required (20 to 60 characters)'
    } else if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      newErrors.name = 'Name must be between 20 and 60 characters long'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!passLength || !passUpper || !passSpecial) {
      newErrors.password = 'Password does not meet required complexity standards'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required (max 400 characters)'
    } else if (formData.address.trim().length > 400) {
      newErrors.address = 'Address must be 400 characters or fewer'
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
      const res = await register(formData)
      setSuccessMsg('Account created successfully!')
      if (onSuccess) {
        onSuccess(res.user)
      }
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl dark:shadow-2xl dark:shadow-black/80 backdrop-blur-xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 mx-auto mb-3">
          S
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Register for a Store Rating System account</p>
      </div>

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-1">
        <Input
          label="Full Name"
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
          error={errors.name}
        />

        <Input
          label="Email Address"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@example.com"
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

        {/* Dynamic Password Hints */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Password Requirements:</p>
          <div className={`flex items-center gap-2 ${passLength ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
            <span className="w-4 text-center">{passLength ? '✓' : '○'}</span>
            <span>8 to 16 characters</span>
          </div>
          <div className={`flex items-center gap-2 ${passUpper ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
            <span className="w-4 text-center">{passUpper ? '✓' : '○'}</span>
            <span>At least one uppercase letter (A-Z)</span>
          </div>
          <div className={`flex items-center gap-2 ${passSpecial ? 'text-emerald-500 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
            <span className="w-4 text-center">{passSpecial ? '✓' : '○'}</span>
            <span>At least one special character (!@#$%...)</span>
          </div>
        </div>

        <Input
          label="Address"
          id="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main Street, Suite 100"
          required
          error={errors.address}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Register Account
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

export default Register
