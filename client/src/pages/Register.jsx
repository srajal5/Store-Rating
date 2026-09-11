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
      setApiError(err.message || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
          S
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create your account</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Join the Store Rating community and share your local store feedback.
        </p>
      </div>

      {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Full Name (20–60 characters)"
          id="register-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Jonathan Alexander Smith"
          required
          autoComplete="name"
          minLength={20}
          maxLength={60}
          error={errors.name}
        />

        <Input
          label="Email Address"
          id="register-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          required
          autoComplete="email"
          error={errors.email}
        />

        <div>
          <Input
            label="Password"
            id="register-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={8}
            maxLength={16}
            error={errors.password}
          />

          {/* Simple Password Requirement Checklist */}
          <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Requirements:</span>
            <div className={`flex items-center gap-1.5 ${passLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
              <span>{passLength ? '✓' : '○'}</span>
              <span>8–16 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passUpper ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
              <span>{passUpper ? '✓' : '○'}</span>
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passSpecial ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
              <span>{passSpecial ? '✓' : '○'}</span>
              <span>At least one special character (!@#$%...)</span>
            </div>
          </div>
        </div>

        <Input
          label="Address (Max 400 characters)"
          id="register-address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g. 123 Main Street, Suite 100, New York, NY"
          required
          autoComplete="street-address"
          maxLength={400}
          error={errors.address}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" fullWidth size="md" loading={loading}>
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

export default Register
