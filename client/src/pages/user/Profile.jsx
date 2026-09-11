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
      setSuccessMsg('Your password has been updated successfully!')
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setApiError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">View your personal account details and update security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-indigo-400/30 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg mx-auto mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{user?.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">{user?.email}</p>

            <div className="mt-4 inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[11px] font-bold rounded-lg uppercase tracking-wider">
              {user?.role}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Personal Information</h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-500 block">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{user?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-500 block">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-500 block">Residential Address</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{user?.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Update Security Password</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">Ensure your account uses a strong, complex password</p>

            {apiError && <Alert type="error" message={apiError} onClose={() => setApiError('')} />}
            {successMsg && <Alert type="success" message={successMsg} />}

            <form onSubmit={handlePasswordSubmit} className="space-y-1">
              <Input
                label="Current Password"
                id="oldPassword"
                name="oldPassword"
                type="password"
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
                value={passData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                error={errors.newPassword}
              />

              {/* Password complexity checklist */}
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password Requirements:</p>
                <div className={`flex items-center gap-2 ${passLength ? 'text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                  <span className="w-4 text-center">{passLength ? '✓' : '○'}</span>
                  <span>8 to 16 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${passUpper ? 'text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                  <span className="w-4 text-center">{passUpper ? '✓' : '○'}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 ${passSpecial ? 'text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                  <span className="w-4 text-center">{passSpecial ? '✓' : '○'}</span>
                  <span>At least one special character (!@#$%...)</span>
                </div>
              </div>

              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                error={errors.confirmPassword}
              />

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <Button type="submit" variant="primary" size="md" loading={loading}>
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
