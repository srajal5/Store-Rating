import React, { useEffect, useState } from 'react'
import { getAdminStores, createAdminStore, getAdminUsers } from '../../services/adminService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'
import StarRating from '../../components/StarRating'
import Modal from '../../components/Modal'
import Button from '../../components/common/Button'

export const Stores = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  // Add Store modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [storeOwners, setStoreOwners] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchStores = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminStores({
        search,
        sortBy,
        sortOrder,
        page,
        limit,
      })
      setStores(res.stores || [])
      setPagination(res.pagination || { total: 0, totalPages: 1 })
    } catch (err) {
      setError(err.message || 'Failed to fetch stores')
    } finally {
      setLoading(false)
    }
  }

  const fetchStoreOwners = async () => {
    try {
      const res = await getAdminUsers({ role: 'STORE_OWNER', limit: 100 })
      setStoreOwners(res.users || [])
    } catch {
      // Non-critical
    }
  }

  useEffect(() => {
    fetchStores()
  }, [search, sortBy, sortOrder, page])

  const handleOpenAddModal = () => {
    setFormError('')
    setFormSuccess('')
    fetchStoreOwners()
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

  const validateStoreForm = () => {
    if (!formData.name || formData.name.trim().length < 1 || formData.name.trim().length > 60) {
      return 'Store name must be between 1 and 60 characters long.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid store email address.'
    }
    if (!formData.address || formData.address.trim().length < 1 || formData.address.trim().length > 400) {
      return 'Store address must be between 1 and 400 characters long.'
    }
    return null
  }

  const handleCreateStore = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const validationMsg = validateStoreForm()
    if (validationMsg) {
      setFormError(validationMsg)
      return
    }

    setSubmitting(true)
    try {
      await createAdminStore({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        owner_id: formData.owner_id ? parseInt(formData.owner_id, 10) : null,
      })
      setFormSuccess('Store successfully created!')
      setFormData({
        name: '',
        email: '',
        address: '',
        owner_id: '',
      })
      fetchStores()
      setTimeout(() => {
        setIsAddModalOpen(false)
        setFormSuccess('')
      }, 900)
    } catch (err) {
      setFormError(err.message || 'Failed to create store')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Stores</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Directory of registered store listings and owner assignments</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg">
            Total Stores: <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
          >
            + Add Store
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
            placeholder="Search stores by name, email, or address..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 placeholder-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
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
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="email-ASC">Email (A-Z)</option>
            <option value="average_rating-DESC">Highest Rating</option>
            <option value="average_rating-ASC">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <Loading text="Loading stores..." />
        ) : stores.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">No stores found</p>
            <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Store {sortBy === 'name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('email')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Email {sortBy === 'email' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('address')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Address {sortBy === 'address' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-4">Owner</th>
                  <th onClick={() => handleSort('average_rating')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    Average Rating {sortBy === 'average_rating' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stores.map((s) => {
                  const rawRating = s.average_rating ?? s.overall_rating ?? s.rating ?? 0
                  const avgRating = parseFloat(rawRating)
                  const totalRatings = Number(s.total_ratings || 0)

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-xs font-bold shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[180px]">{s.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.email}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{s.address}</td>
                      <td className="py-3 px-4">
                        {s.owner_name ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-slate-200">{s.owner_name}</span>
                            <span className="text-[10px] text-slate-400">{s.owner_email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {totalRatings > 0 && avgRating > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <StarRating value={Math.round(avgRating)} disabled size="sm" />
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                              {avgRating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({totalRatings})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No ratings yet</span>
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

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Store"
      >
        {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
        {formSuccess && <Alert type="success" message={formSuccess} />}

        <form onSubmit={handleCreateStore} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Name <span className="text-slate-400 font-normal">(Max 60 characters)</span> *
            </label>
            <input
              type="text"
              name="organization"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Electronics"
              required
              maxLength={60}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Email Address *
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="support@apextech.com"
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Owner Assignment <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">-- Unassigned --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Address <span className="text-slate-400 font-normal">(Max 400 characters)</span> *
            </label>
            <textarea
              name="street-address"
              autoComplete="street-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 124 Tech Blvd, Austin, TX 78701"
              required
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
              Create Store
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Stores
