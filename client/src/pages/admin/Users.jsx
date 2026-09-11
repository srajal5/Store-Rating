import React, { useEffect, useState } from 'react'
import { getAdminUsers, createAdminUser } from '../../services/adminService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import Button from '../../components/common/Button'
import StarRating from '../../components/StarRating'

export const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  // Add User modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      setUsers(res.users || [])
      setPagination(res.pagination || { total: 0, totalPages: 1 })
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

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      return 'Name must be between 20 and 60 characters long.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email address.'
    }
    if (!formData.password || formData.password.length < 8 || formData.password.length > 16) {
      return 'Password must be between 8 and 16 characters long.'
    }
    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter.'
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      return 'Password must contain at least one special character.'
    }
    if (formData.address && formData.address.length > 400) {
      return 'Address cannot exceed 400 characters.'
    }
    return null
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const validationMsg = validateForm()
    if (validationMsg) {
      setFormError(validationMsg)
      return
    }

    setSubmitting(true)
    try {
      await createAdminUser(formData)
      setFormSuccess('User successfully created!')
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER',
      })
      fetchUsers()
      setTimeout(() => {
        setIsAddModalOpen(false)
        setFormSuccess('')
      }, 1000)
    } catch (err) {
      setFormError(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse, filter, and add system users and store owners</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 px-3 py-1.5 rounded-xl">
            Total Users: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pagination.total}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError('')
              setFormSuccess('')
              setIsAddModalOpen(true)
            }}
          >
            + Add User
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="p-4 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-indigo-400 transition-colors">
                    Name {sortBy === 'name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('email')} className="py-3.5 px-4 cursor-pointer hover:text-indigo-400 transition-colors">
                    Email {sortBy === 'email' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('address')} className="py-3.5 px-4 cursor-pointer hover:text-indigo-400 transition-colors">
                    Address {sortBy === 'address' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('role')} className="py-3.5 px-4 cursor-pointer hover:text-indigo-400 transition-colors">
                    Role {sortBy === 'role' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3.5 px-4">Store / Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {users.map((u) => {
                  const storeRating = parseFloat(u.store_rating || 0)
                  const totalStoreRatings = Number(u.store_total_ratings || 0)

                  return (
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
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border ${
                            u.role === 'ADMIN'
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                              : u.role === 'STORE_OWNER'
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                              : 'bg-green-500/10 border-green-500/30 text-green-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.role === 'STORE_OWNER' ? (
                          u.store_name ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-slate-900 dark:text-slate-200">{u.store_name}</span>
                              <div className="flex items-center gap-1.5">
                                <StarRating value={Math.round(storeRating)} disabled size="sm" />
                                <span className="font-mono text-xs font-bold text-amber-400">
                                  {totalStoreRatings > 0 && storeRating > 0 ? storeRating.toFixed(1) : 'N/A'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">No store assigned</span>
                          )
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div>
              Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
        {formSuccess && <Alert type="success" message={formSuccess} />}

        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-slate-400">(20–60 characters)</span> *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jonathan Alexander Smith"
              required
              minLength={20}
              maxLength={60}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-slate-400">(8–16 chars, 1 uppercase, 1 special)</span> *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={16}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="USER">Normal User (USER)</option>
              <option value="STORE_OWNER">Store Owner (STORE_OWNER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address <span className="text-slate-400">(Max 400 characters)</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 123 Tech Boulevard, Suite 400, New York, NY"
              maxLength={400}
              rows={3}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-6">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={submitting}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users
