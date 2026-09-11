import React, { useEffect, useState } from 'react'
import { getAdminUsers, createAdminUser, getAdminStores } from '../../services/adminService'
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
  const [availableStores, setAvailableStores] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
    store_id: '',
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

  const fetchStoresList = async () => {
    try {
      const res = await getAdminStores({ limit: 100 })
      setAvailableStores(res.stores || [])
    } catch {
      // Non-critical
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, sortBy, sortOrder, page])

  const handleOpenAddModal = () => {
    setFormError('')
    setFormSuccess('')
    fetchStoresList()
    setIsAddModalOpen(true)
  }

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
      const createdUser = await createAdminUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim() || null,
        role: formData.role,
      })

      // If STORE_OWNER and a store was selected, assign the store
      if (formData.role === 'STORE_OWNER' && formData.store_id && createdUser?.id) {
        try {
          const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
          const token = localStorage.getItem('token')
          await fetch(`${API_BASE}/stores/${formData.store_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ owner_id: createdUser.id }),
          })
        } catch {
          // Non-blocking
        }
      }

      setFormSuccess('User successfully created!')
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER',
        store_id: '',
      })
      fetchUsers()
      setTimeout(() => {
        setIsAddModalOpen(false)
        setFormSuccess('')
      }, 900)
    } catch (err) {
      setFormError(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage system administrators, store owners, and normal user accounts</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg">
            Total Users: <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
          >
            + Add User
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 placeholder-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE OWNER</option>
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
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <Loading text="Loading users..." />
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">No users found</p>
            <p className="text-xs text-slate-500 mt-0.5">Try changing your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Name {sortBy === 'name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('email')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Email {sortBy === 'email' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('address')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Address {sortBy === 'address' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('role')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Role {sortBy === 'role' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-4">Store / Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const storeRating = parseFloat(u.store_rating || 0)
                  const totalStoreRatings = Number(u.store_total_ratings || 0)

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[180px]">{u.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{u.address || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${
                            u.role === 'ADMIN'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                              : u.role === 'STORE_OWNER'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {u.role === 'STORE_OWNER' ? 'STORE OWNER' : u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.role === 'STORE_OWNER' ? (
                          u.store_name ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-slate-900 dark:text-slate-200">{u.store_name}</span>
                              <div className="flex items-center gap-1.5">
                                <StarRating value={Math.round(storeRating)} disabled size="sm" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {totalStoreRatings > 0 && storeRating > 0 ? storeRating.toFixed(1) : 'No ratings yet'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div>
              Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
        {formSuccess && <Alert type="success" message={formSuccess} />}

        <form onSubmit={handleCreateUser} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-slate-400 font-normal">(20–60 characters)</span> *
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jonathan Alexander Smith"
              required
              minLength={20}
              maxLength={60}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-slate-400 font-normal">(8–16 chars, 1 uppercase, 1 special)</span> *
            </label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={16}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="USER">Normal User (USER)</option>
              <option value="STORE_OWNER">Store Owner (STORE_OWNER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>

          {formData.role === 'STORE_OWNER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Store <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={formData.store_id}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="">-- Select Store (or assign later) --</option>
                {availableStores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.address})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address <span className="text-slate-400 font-normal">(Max 400 characters)</span>
            </label>
            <textarea
              name="street-address"
              autoComplete="street-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 123 Tech Boulevard, Suite 400, New York, NY"
              maxLength={400}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
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
