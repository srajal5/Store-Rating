import React, { useEffect, useState } from 'react'
import { getAdminStores } from '../../services/adminService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'
import StarRating from '../../components/StarRating'

export const Stores = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Query state
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

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
      setStores(res.stores)
      setPagination(res.pagination)
    } catch (err) {
      setError(err.message || 'Failed to fetch stores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [search, sortBy, sortOrder, page])

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Store Management</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Browse, filter, and monitor all registered system stores</p>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl">
          Total Stores: <span className="text-purple-400 font-bold">{pagination.total}</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
            placeholder="Search stores by name, email, or address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-500 transition-all"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
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
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="email-ASC">Email (A-Z)</option>
            <option value="address-ASC">Address (A-Z)</option>
            <option value="average_rating-DESC">Highest Rating</option>
            <option value="average_rating-ASC">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Stores Data Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <Loading text="Loading stores..." />
        ) : stores.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">No stores found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer transition-colors">
                    Store Name {sortBy === 'name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('email')} className="py-3.5 px-4 cursor-pointer transition-colors">
                    Email {sortBy === 'email' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('address')} className="py-3.5 px-4 cursor-pointer transition-colors">
                    Address {sortBy === 'address' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th onClick={() => handleSort('average_rating')} className="py-3.5 px-4 cursor-pointer transition-colors">
                    Avg Rating {sortBy === 'average_rating' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stores.map((s) => {
                  const avgRating = parseFloat(s.average_rating || 0)
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{s.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{s.email}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{s.address}</td>
                      <td className="py-3 px-4">
                        {s.owner_name ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-200">{s.owner_name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-500">{s.owner_email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StarRating value={Math.round(avgRating)} disabled size="sm" />
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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

export default Stores
