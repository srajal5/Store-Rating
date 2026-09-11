import React, { useEffect, useState } from 'react'
import { getStores } from '../../services/storeService'
import { submitRating } from '../../services/ratingService'
import Alert from '../../components/common/Alert'
import Loading from '../../components/Loading'
import StarRating from '../../components/StarRating'
import Modal from '../../components/Modal'
import Button from '../../components/common/Button'

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
          ? 'Your rating has been updated!'
          : 'Thank you! Your rating has been submitted.'
      )
      fetchStores()
      setTimeout(() => {
        setSelectedStore(null)
        setSubmitSuccess('')
      }, 1000)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Explore Stores</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Browse stores, submit ratings, or update your existing feedback</p>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1.5 rounded-xl">
          Available Stores: <span className="text-emerald-400 font-bold">{pagination.total}</span>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
            placeholder="Search stores by name, email, or location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-500 transition-all"
          />
        </div>

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
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="email-ASC">Email (A-Z)</option>
            <option value="address-ASC">Address (A-Z)</option>
            <option value="average_rating-DESC">Highest Rating</option>
            <option value="average_rating-ASC">Lowest Rating</option>
            <option value="created_at-DESC">Newest Stores</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading text="Loading available stores..." />
      ) : stores.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">No stores found</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((s) => {
            const rawRating = s.overall_rating ?? s.average_rating ?? s.rating ?? 0
            const overallRating = parseFloat(rawRating)
            const totalRatings = Number(s.total_ratings || 0)
            const hasUserRated = s.user_rating !== null && s.user_rating !== undefined

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm shadow-inner shrink-0 group-hover:bg-indigo-600/30 transition-colors">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {s.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate max-w-[180px]">{s.email}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 flex items-start gap-1.5 line-clamp-2 leading-relaxed p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50">
                    <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{s.address}</span>
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2.5 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Overall Rating</span>
                      <div className="flex items-center gap-1.5">
                        <StarRating value={Math.round(overallRating)} disabled size="sm" />
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {totalRatings > 0 && overallRating > 0 ? overallRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Your Rating</span>
                      {hasUserRated ? (
                        <div className="flex items-center gap-1.5">
                          <StarRating value={s.user_rating} disabled size="sm" />
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {s.user_rating} ★
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-500 italic">Not rated yet</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant={hasUserRated ? 'secondary' : 'primary'}
                  size="md"
                  fullWidth
                  onClick={() => openRatingModal(s)}
                >
                  {hasUserRated ? 'Modify My Rating' : 'Rate This Store'}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl backdrop-blur-md flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
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

      <Modal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={selectedStore?.user_rating ? `Modify Rating for ${selectedStore?.name}` : `Rate ${selectedStore?.name}`}
      >
        {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}
        {submitSuccess && <Alert type="success" message={submitSuccess} />}

        <div className="text-center py-4 space-y-4">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Click on a star to set your rating from 1 to 5:
          </p>

          <div className="flex justify-center py-2">
            <StarRating
              value={ratingValue}
              onChange={(val) => setRatingValue(val)}
              size="lg"
            />
          </div>

          <div className="font-mono text-sm font-bold text-amber-400">
            {ratingValue > 0 ? `${ratingValue} out of 5 Stars` : 'Select your rating'}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-4">
          <Button variant="secondary" size="md" onClick={() => setSelectedStore(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
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
