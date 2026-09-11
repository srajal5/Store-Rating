import React, { useEffect, useState } from 'react'
import { getAdminUsers } from '../../services/adminService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'

export const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Query state
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminUsers({
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
        page,
        limit,
      })
      setUsers(res.users)
      setPagination(res.pagination)
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, sortBy, sortOrder, page])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('ASC')
    }
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">Browse, filter, and inspect registered system users</p>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 px-3 py-1.5 rounded-xl">
          Total Users: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pagination.total}</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Toolbar */}
      <div className="p-4 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name, email, or address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-500 transition-all"
          />
        </div>

        {/* Role Filter & Sort */}
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="USER">USER</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sBy, sOrd] = e.target.value.split('-')
              setSortBy(sBy)
              setSortOrder(sOrd)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="email-ASC">Email (A-Z)</option>
            <option value="role-ASC">Role</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <Loading text="Loading users..." />
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">No users found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors">
                    Name {sortBy === 'name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('email')} className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors">
                    Email {sortBy === 'email' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('address')} className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors">
                    Address {sortBy === 'address' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('role')} className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors">
                    Role {sortBy === 'role' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{u.address || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border ${u.role === 'ADMIN'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                          : u.role === 'STORE_OWNER'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-green-500/10 border-green-500/30 text-green-400'
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div>
              Page <span className="font-semibold text-white">{page}</span> of{' '}
              <span className="font-semibold text-white">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users
