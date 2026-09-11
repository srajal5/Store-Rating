import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { changePassword } from '../../services/authService'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'

export const Profile = () => {
  const { user } = useAuth()
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setPassData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Password complexity checks
  const passLength = passData.newPassword.length >= 8 && passData.newPassword.length <= 16
  const passUpper = /[A-Z]/.test(passData.newPassword)
  const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passData.newPassword)

  const validate = () => {
    const errs = {}
    if (!passData.oldPassword) errs.oldPassword = 'Current password is required'
    if (!passData.newPassword) errs.newPassword = 'New password is required'
    else if (!passLength || !passUpper || !passSpecial) {
      errs.newPassword = 'Password does not meet required complexity standards'
    }

    if (passData.newPassword !== passData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccessMsg('')

    if (!validate()) return

    setLoading(true)
    try {
      await changePassword(passData.oldPassword, passData.newPassword)
      setSuccessMsg('Your password has been updated successfully.')
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setApiError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile details and account security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Information Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xl flex items-center justify-center mx-auto mb-3 border border-slate-200 dark:border-slate-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{user?.name}</h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>

            <div className="mt-3">
              <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded tracking-wider uppercase">
                {user?.role === 'STORE_OWNER' ? 'STORE OWNER' : user?.role}
              </span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Information</h4>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Address</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{user?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Security & Password Update */}
        <div className="lg:col-span-2">
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Account Security</h3>
            <p className="text-xs text-slate-500 mb-5">Change your account password to keep your account secure</p>

            {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
            {successMsg && <Alert type="success" message={successMsg} />}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
              <Input
                label="Current Password"
                id="oldPassword"
                name="oldPassword"
                type="password"
                autoComplete="current-password"
                value={passData.oldPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                error={errors.oldPassword}
              />

              <Input
                label="New Password"
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={passData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                error={errors.newPassword}
              />

              {/* Password Requirements Helper */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-150 dark:border-slate-800 text-xs space-y-1">
                <p className="font-medium text-slate-600 dark:text-slate-400 text-[11px] mb-1">Password Requirements:</p>
                <div className={`flex items-center gap-1.5 ${passLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  <span>{passLength ? '✓' : '○'}</span>
                  <span>8 to 16 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  <span>{passUpper ? '✓' : '○'}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  <span>{passSpecial ? '✓' : '○'}</span>
                  <span>At least one special character (!@#$%...)</span>
                </div>
              </div>

              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={passData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                error={errors.confirmPassword}
              />

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button type="submit" variant="primary" size="sm" loading={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
