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
      newErrors.email = 'Email address is required'
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
      setApiError(err.message || 'Invalid email or password. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Left Context & Marketing Area (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-50 dark:bg-slate-950/50 p-8 flex-col justify-between border-r border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              S
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
              Store Rating
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
            Discover places people recommend.
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Rate local stores, share authentic experiences, and help your community find better businesses.
          </p>

          {/* Simple Store Card Preview */}
          <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Apex Electronics</span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
              <span>★ ★ ★ ★ ★</span>
              <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">4.8</span>
              <span className="text-slate-400 font-normal text-[11px]">(124 ratings)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              "Great tech selection and friendly in-store customer support."
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500">
          Trusted by community shoppers & local business owners.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
        <div className="mb-6">
          <div className="flex lg:hidden items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              S
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Store Rating</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome back</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Sign in to manage your ratings, stores, or platform settings.
          </p>
        </div>

        {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email Address"
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            required
            autoComplete="email"
            error={errors.email}
          />

          <Input
            label="Password"
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error={errors.password}
          />

          <div className="pt-1">
            <Button type="submit" variant="primary" fullWidth size="md" loading={loading}>
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
