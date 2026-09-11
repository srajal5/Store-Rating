import React, { useEffect, useState } from 'react'
import { getStores } from '../../services/storeService'
import { submitRating } from '../../services/ratingService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'
import StarRating from '../../components/StarRating'
import Modal from '../../components/Modal'
import Button from '../../components/common/Button'

// Helper to determine subtle category metadata based on store name
const getStoreCategory = (name = '') => {
  const lower = name.toLowerCase()
  if (lower.includes('tech') || lower.includes('electronic') || lower.includes('computer') || lower.includes('digital')) {
    return { label: 'Electronics', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900' }
  }
  if (lower.includes('cafe') || lower.includes('coffee') || lower.includes('food') || lower.includes('veg') || lower.includes('restaurant') || lower.includes('bistro') || lower.includes('bakery')) {
    return { label: 'Food & Dining', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900' }
  }
  if (lower.includes('mart') || lower.includes('grocery') || lower.includes('market') || lower.includes('supermarket') || lower.includes('store')) {
    return { label: 'Grocery & Market', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' }
  }
  if (lower.includes('decor') || lower.includes('furniture') || lower.includes('home') || lower.includes('living')) {
    return { label: 'Home Decor', color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-900' }
  }
  if (lower.includes('fashion') || lower.includes('clothing') || lower.includes('apparel') || lower.includes('wear')) {
    return { label: 'Apparel', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-900' }
  }
  return { label: 'Local Store', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
}

export const UserStores = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('ASC')
  const [page, setPage] = useState(1)
  const [limit] = useState(9)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const [selectedStore, setSelectedStore] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchStores = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getStores({
        search,
        sortBy,
        sortOrder,
        page,
        limit,
      })
      setStores(res.stores || [])
      setPagination(res.pagination || { total: 0, totalPages: 1 })
    } catch (err) {
      setError(err.message || 'Failed to load stores list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [search, sortBy, sortOrder, page])

  const openRatingModal = (store) => {
    setSelectedStore(store)
    setRatingValue(store.user_rating || 0)
    setSubmitError('')
    setSubmitSuccess('')
  }

  const handleRatingSubmit = async () => {
    if (!selectedStore) return
    if (ratingValue < 1 || ratingValue > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      await submitRating(selectedStore.id, ratingValue)
      setSubmitSuccess(
        selectedStore.user_rating
          ? 'Your rating has been updated.'
          : 'Thank you! Rating submitted successfully.'
      )
      fetchStores()
      setTimeout(() => {
        setSelectedStore(null)
        setSubmitSuccess('')
      }, 900)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Explore Stores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discover places people recommend, share your experiences, and rate local businesses
          </p>
        </div>
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
          Total Stores: <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Search and Filters */}
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
          <label htmlFor="store-sort" className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">Sort by:</label>
          <select
            id="store-sort"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sBy, sOrd] = e.target.value.split('-')
              setSortBy(sBy)
              setSortOrder(sOrd)
              setPage(1)
            }}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="average_rating-DESC">Highest Rating</option>
            <option value="average_rating-ASC">Lowest Rating</option>
            <option value="created_at-DESC">Newest Stores</option>
          </select>
        </div>
      </div>

      {/* Store List */}
      {loading ? (
        <Loading text="Loading stores..." />
      ) : stores.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">No stores found</p>
          <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((s) => {
            const rawRating = s.overall_rating ?? s.average_rating ?? s.rating ?? 0
            const overallRating = parseFloat(rawRating)
            const totalRatings = Number(s.total_ratings || 0)
            const hasUserRated = s.user_rating !== null && s.user_rating !== undefined
            const category = getStoreCategory(s.name)

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Top Header: Avatar, Name, Category */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
                          {s.name}
                        </h3>
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border mt-0.5 ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Rating Section */}
                  <div className="my-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    {totalRatings > 0 && overallRating > 0 ? (
                      <div className="flex items-center gap-2">
                        <StarRating value={Math.round(overallRating)} disabled size="sm" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {overallRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <StarRating value={0} disabled size="sm" />
                        <span className="text-xs text-slate-500 italic">No ratings yet</span>
                      </div>
                    )}
                  </div>

                  {/* Contact & Location Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 text-xs">✉</span>
                      <span className="truncate">{s.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 text-xs mt-0.5">⌖</span>
                      <span className="line-clamp-2 leading-relaxed">{s.address}</span>
                    </div>
                  </div>

                  {/* User's Rating Box */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-150 dark:border-slate-800/80 mb-4 text-xs flex items-center justify-between">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Your rating:</span>
                    {hasUserRated ? (
                      <div className="flex items-center gap-1.5">
                        <StarRating value={s.user_rating} disabled size="sm" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {s.user_rating} ★
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not rated yet</span>
                    )}
                  </div>
                </div>

                {/* Rating Action Button */}
                <Button
                  variant={hasUserRated ? 'secondary' : 'primary'}
                  size="sm"
                  fullWidth
                  onClick={() => openRatingModal(s)}
                >
                  {hasUserRated ? 'Modify your rating' : 'Rate this store'}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div>
            Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Rating Submission / Modification Modal */}
      <Modal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={selectedStore ? `Rate ${selectedStore.name}` : 'Rate Store'}
      >
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
        {submitSuccess && <Alert type="success" message={submitSuccess} />}

        <div className="py-3 text-center space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            How would you rate your experience?
          </p>

          <div className="flex justify-center py-2">
            <StarRating
              value={ratingValue}
              onChange={(val) => setRatingValue(val)}
              size="lg"
            />
          </div>

          <div className="flex items-center justify-between px-6 text-[11px] text-slate-400">
            <span>1 - Poor</span>
            <span className="font-bold text-slate-900 dark:text-white text-xs">
              {ratingValue > 0 ? `${ratingValue} / 5 Stars` : 'Select stars'}
            </span>
            <span>5 - Excellent</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setSelectedStore(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRatingSubmit}
            loading={submitting}
            disabled={ratingValue === 0}
          >
            Submit Rating
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default UserStores
