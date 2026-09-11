import pool from '../config/db.js'

/**
 * GET /api/owner/dashboard
 * Dashboard stats for the authenticated STORE_OWNER.
 * Uses req.user.id from JWT for strict ownership enforcement.
 */
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id

    // Fetch store owned by this user
    const [stores] = await pool.query(
      'SELECT id, name, email, address, created_at, updated_at FROM stores WHERE owner_id = ?',
      [ownerId]
    )

    if (stores.length === 0) {
      return res.json({
        success: true,
        message: 'No store currently assigned to your store owner account.',
        store: null,
        stats: {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        recent_ratings: [],
      })
    }

    const store = stores[0]

    // Fetch average rating & total ratings
    const [statsRows] = await pool.query(
      `SELECT 
        COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating,
        COUNT(id) AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [store.id]
    )

    // Fetch rating distribution (1 to 5 stars)
    const [distributionRows] = await pool.query(
      `SELECT rating, COUNT(*) AS count 
       FROM ratings 
       WHERE store_id = ? 
       GROUP BY rating`,
      [store.id]
    )

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    distributionRows.forEach((row) => {
      if (ratingDistribution[row.rating] !== undefined) {
        ratingDistribution[row.rating] = Number(row.count)
      }
    })

    // Fetch top 10 recent ratings with user details
    const [recentRatings] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [store.id]
    )

    res.json({
      success: true,
      store,
      stats: {
        average_rating: Number(statsRows[0].average_rating),
        total_ratings: Number(statsRows[0].total_ratings),
        rating_distribution: ratingDistribution,
      },
      recent_ratings: recentRatings,
    })
  } catch (error) {
    console.error('Get store owner dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving store owner dashboard.',
      error: error.message,
    })
  }
}

/**
 * GET /api/owner/ratings
 * Full paginated ratings list for the authenticated STORE_OWNER's store.
 */
export const getOwnerRatings = async (req, res) => {
  try {
    const ownerId = req.user.id

    // Fetch store owned by this user
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE owner_id = ?', [ownerId])

    if (stores.length === 0) {
      return res.json({
        success: true,
        message: 'No store assigned to your account.',
        store: null,
        ratings: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      })
    }

    const store = stores[0]
    const {
      search,
      rating,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
    const offset = (pageNum - 1) * limitNum

    const allowedSortMap = {
      id: 'r.id',
      rating: 'r.rating',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
      user_name: 'u.name',
    }

    const safeSortBy = (typeof sortBy === 'string' && allowedSortMap[sortBy]) ? allowedSortMap[sortBy] : 'r.created_at'
    const safeSortOrder = (typeof sortOrder === 'string' && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

    let whereClauses = ['r.store_id = ?']
    let queryParams = [store.id]

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ?)')
      queryParams.push(searchPattern, searchPattern)
    }

    if (rating) {
      const parsedRating = parseInt(rating, 10)
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        whereClauses.push('r.rating = ?')
        queryParams.push(parsedRating)
      }
    }

    const whereSQL = `WHERE ${whereClauses.join(' AND ')}`

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      ${whereSQL}
    `
    const [countRows] = await pool.query(countQuery, queryParams)
    const total = countRows[0].total
    const totalPages = Math.ceil(total / limitNum) || 1

    const dataQuery = `
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      ${whereSQL}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `

    const dataQueryParams = [...queryParams, limitNum, offset]
    const [ratings] = await pool.query(dataQuery, dataQueryParams)

    res.json({
      success: true,
      store,
      ratings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get store owner ratings error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving store ratings.',
      error: error.message,
    })
  }
}
