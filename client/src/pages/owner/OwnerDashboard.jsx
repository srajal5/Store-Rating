import React, { useEffect, useState } from 'react'
import { getOwnerDashboard, getOwnerRatings } from '../../services/ownerService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'
import StarRating from '../../components/StarRating'

export const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Ratings table query state
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashRes, ratingsRes] = await Promise.all([
        getOwnerDashboard(),
        getOwnerRatings({
          search,
          rating: ratingFilter,
          sortBy,
          sortOrder,
          page,
          limit,
        }),
      ])
      setDashboardData(dashRes)
      setRatings(ratingsRes.ratings || [])
      setPagination(ratingsRes.pagination || { total: 0, totalPages: 1 })
    } catch (err) {
      setError(err.message || 'Failed to load store dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [search, ratingFilter, sortBy, sortOrder, page])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('ASC')
    }
    setPage(1)
  }

  if (loading && !dashboardData) {
    return <Loading text="Loading store dashboard..." />
  }

  const store = dashboardData?.store
  const stats = dashboardData?.stats || {}
  const distribution = stats.rating_distribution || dashboardData?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const totalRatingsCount = stats.total_ratings ?? dashboardData?.total_ratings ?? 0
  const avgRating = parseFloat(stats.average_rating ?? dashboardData?.average_rating ?? 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Store Owner Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {store?.name ? `Overview and customer feedback for ${store.name}` : 'Overview and customer feedback for your store'}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Store Banner & Metrics Grid */}
      {store ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Store Info Banner */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center font-bold text-sm shrink-0">
                  {store.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{store.name}</h2>
                  <p className="text-xs text-slate-500 truncate">{store.email}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-150 dark:border-slate-800 space-y-1 text-xs mb-3">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Address</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{store.address}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Managed Store</span>
              <span className="font-mono text-[11px] text-slate-400">ID #{store.id}</span>
            </div>
          </div>

          {/* Average Rating Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</span>
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            </div>

            <div className="my-2">
              {totalRatingsCount > 0 && avgRating > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                  <div className="mt-2">
                    <StarRating value={Math.round(avgRating)} disabled size="md" />
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <span className="text-sm font-semibold text-slate-500 italic">No ratings yet</span>
                  <div className="mt-1">
                    <StarRating value={0} disabled size="md" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Customer Ratings</span>
              <span className="font-semibold text-slate-900 dark:text-white">{totalRatingsCount} total</span>
            </div>
          </div>

          {/* Rating Breakdown Distribution Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rating Breakdown</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0
                const percent = totalRatingsCount > 0 ? (count / totalRatingsCount) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2.5 text-xs">
                    <span className="w-10 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {star} <span className="text-amber-500 text-[11px]">★</span>
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-medium text-slate-500">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
          <p className="text-slate-700 dark:text-slate-300 font-medium">No store assigned to your owner account yet.</p>
        </div>
      )}

      {/* Customer Ratings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Customer Ratings</h2>
          <span className="text-xs text-slate-500">Total Reviews: {pagination.total}</span>
        </div>

        {/* Search & Sort Filters */}
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
              placeholder="Search by customer name or email..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 placeholder-slate-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
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
              <option value="rating-DESC">Highest Rating</option>
              <option value="rating-ASC">Lowest Rating</option>
              <option value="user_name-ASC">Customer Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Customer Reviews Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {ratings.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">No customers have rated your store yet.</p>
              <p className="text-xs text-slate-500 mt-0.5">Ratings from customers will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th onClick={() => handleSort('user_name')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                      Customer {sortBy === 'user_name' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                    <th className="py-3 px-4">Email</th>
                    <th onClick={() => handleSort('rating')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                      Rating {sortBy === 'rating' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                    <th onClick={() => handleSort('created_at')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                      Date {sortBy === 'created_at' ? (sortOrder === 'ASC' ? '↑' : '↓') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ratings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {r.user_name ? r.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span>{r.user_name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.user_email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={r.rating} disabled size="sm" />
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {r.rating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
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
      </div>
    </div>
  )
}

export default OwnerDashboard
