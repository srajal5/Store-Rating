import React, { useEffect, useState } from 'react'
import { getAdminDashboardStats } from '../../services/adminService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'

export const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return <Loading text="Loading system metrics..." />
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">High-level store rating system statistics and analytics</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-3.5 py-2 text-slate-900 dark:text-white border border-slate-700/80 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {stats && (
        <>
          {/* Key Stat Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Users */}
            <div className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
                  <h3 className="text-3xl font-extrabold text-black dark:text-white mt-2 font-mono">{stats.total_users}</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">Registered accounts</span>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('users')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                  >
                    View Users &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Total Stores */}
            <div className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Stores</p>
                  <h3 className="text-3xl font-extrabold text-black dark:text-white mt-2 font-mono">{stats.total_stores}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">Registered store listings</span>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('stores')}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors"
                  >
                    View Stores &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Total Ratings */}
            <div className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Ratings</p>
                  <h3 className="text-3xl font-extrabold text-black dark:text-white mt-2 font-mono">{stats.total_ratings}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">Submitted customer reviews</span>
                <span className="text-amber-400 font-semibold">System Wide</span>
              </div>
            </div>
          </div>

          {/* User Roles Breakdown Card */}
          <div className="p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">User Roles Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Administrators</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1.5 font-mono">{stats.users_by_role?.ADMIN || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Store Owners</p>
                <p className="text-2xl font-bold text-purple-400 mt-1.5 font-mono">{stats.users_by_role?.STORE_OWNER || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Normal Users</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1.5 font-mono">{stats.users_by_role?.USER || 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
