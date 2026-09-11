import pool from '../config/db.js'

/**
 * GET /api/admin/dashboard
 * Get high-level summary statistics for the admin dashboard.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [usersCountRows] = await pool.query('SELECT COUNT(*) AS total_users FROM users')
    const [storesCountRows] = await pool.query('SELECT COUNT(*) AS total_stores FROM stores')
    const [ratingsCountRows] = await pool.query('SELECT COUNT(*) AS total_ratings FROM ratings')

    // Role breakdown
    const [roleBreakdownRows] = await pool.query(
      'SELECT role, COUNT(*) AS count FROM users GROUP BY role'
    )

    const roleCounts = {
      ADMIN: 0,
      STORE_OWNER: 0,
      USER: 0,
    }

    roleBreakdownRows.forEach((row) => {
      if (roleCounts[row.role] !== undefined) {
        roleCounts[row.role] = Number(row.count)
      }
    })

    res.json({
      success: true,
      stats: {
        total_users: Number(usersCountRows[0].total_users),
        total_stores: Number(storesCountRows[0].total_stores),
        total_ratings: Number(ratingsCountRows[0].total_ratings),
        users_by_role: roleCounts,
      },
    })
  } catch (error) {
    console.error('Get admin dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving dashboard statistics.' : (error.message || 'Server error retrieving dashboard statistics.'),
    })
  }
}

/**
 * GET /api/admin/users
 * Admin user management with search, filter, sort, and pagination.
 */
export const getAdminUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      name,
      email,
      address,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
    const offset = (pageNum - 1) * limitNum

    const allowedSortMap = {
      id: 'u.id',
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'store_rating',
      store_rating: 'store_rating',
      created_at: 'u.created_at',
      updated_at: 'u.updated_at',
    }

    const lowerSortBy = typeof sortBy === 'string' ? sortBy.toLowerCase() : ''
    const safeSortBy = allowedSortMap[lowerSortBy] || allowedSortMap[sortBy] || 'u.created_at'
    const safeSortOrder = (typeof sortOrder === 'string' && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

    let whereClauses = []
    let queryParams = []

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)')
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    if (role && typeof role === 'string' && ['ADMIN', 'USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      whereClauses.push('u.role = ?')
      queryParams.push(role.toUpperCase())
    }

    if (name && typeof name === 'string' && name.trim() !== '') {
      whereClauses.push('u.name LIKE ?')
      queryParams.push(`%${name.trim()}%`)
    }

    if (email && typeof email === 'string' && email.trim() !== '') {
      whereClauses.push('u.email LIKE ?')
      queryParams.push(`%${email.trim()}%`)
    }

    if (address && typeof address === 'string' && address.trim() !== '') {
      whereClauses.push('u.address LIKE ?')
      queryParams.push(`%${address.trim()}%`)
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    const countQuery = `SELECT COUNT(DISTINCT u.id) AS total FROM users u ${whereSQL}`
    const [countRows] = await pool.query(countQuery, queryParams)
    const total = countRows[0].total
    const totalPages = Math.ceil(total / limitNum) || 1

    const dataQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at, 
        u.updated_at,
        s.id AS store_id,
        s.name AS store_name,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS store_rating,
        COUNT(r.id) AS store_total_ratings
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereSQL}
      GROUP BY u.id, s.id
      ORDER BY ${safeSortBy} ${safeSortOrder} 
      LIMIT ? OFFSET ?
    `

    const dataQueryParams = [...queryParams, limitNum, offset]
    const [users] = await pool.query(dataQuery, dataQueryParams)

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving users for admin.' : (error.message || 'Server error retrieving users for admin.'),
    })
  }
}

/**
 * GET /api/admin/stores
 * Admin store management with search, filter, sort, and pagination.
 */
export const getAdminStores = async (req, res) => {
  try {
    const {
      search,
      name,
      email,
      address,
      owner_id,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
    const offset = (pageNum - 1) * limitNum

    const allowedSortMap = {
      id: 's.id',
      name: 's.name',
      email: 's.email',
      address: 's.address',
      owner_id: 's.owner_id',
      rating: 'average_rating',
      average_rating: 'average_rating',
      total_ratings: 'total_ratings',
      created_at: 's.created_at',
      updated_at: 's.updated_at',
    }

    const lowerSortBy = typeof sortBy === 'string' ? sortBy.toLowerCase() : ''
    const safeSortBy = allowedSortMap[lowerSortBy] || allowedSortMap[sortBy] || 's.created_at'
    const safeSortOrder = (typeof sortOrder === 'string' && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

    let whereClauses = []
    let queryParams = []

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`
      whereClauses.push('(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)')
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    if (name && typeof name === 'string' && name.trim() !== '') {
      whereClauses.push('s.name LIKE ?')
      queryParams.push(`%${name.trim()}%`)
    }

    if (email && typeof email === 'string' && email.trim() !== '') {
      whereClauses.push('s.email LIKE ?')
      queryParams.push(`%${email.trim()}%`)
    }

    if (address && typeof address === 'string' && address.trim() !== '') {
      whereClauses.push('s.address LIKE ?')
      queryParams.push(`%${address.trim()}%`)
    }

    if (owner_id) {
      const parsedOwnerId = parseInt(owner_id, 10)
      if (!isNaN(parsedOwnerId)) {
        whereClauses.push('s.owner_id = ?')
        queryParams.push(parsedOwnerId)
      }
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    const countQuery = `SELECT COUNT(DISTINCT s.id) AS total FROM stores s ${whereSQL}`
    const [countRows] = await pool.query(countQuery, queryParams)
    const total = countRows[0].total
    const totalPages = Math.ceil(total / limitNum) || 1

    const dataQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereSQL}
      GROUP BY s.id, u.id
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `

    const dataQueryParams = [...queryParams, limitNum, offset]
    const [stores] = await pool.query(dataQuery, dataQueryParams)

    res.json({
      success: true,
      stores,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get admin stores error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving stores for admin.' : (error.message || 'Server error retrieving stores for admin.'),
    })
  }
}

/**
 * GET /api/admin/ratings
 * Admin rating management with search, filter, sort, and pagination.
 */
export const getAdminRatings = async (req, res) => {
  try {
    const {
      search,
      store_id,
      user_id,
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
      store_name: 's.name',
      user_name: 'u.name',
    }

    const safeSortBy = (typeof sortBy === 'string' && allowedSortMap[sortBy]) ? allowedSortMap[sortBy] : 'r.created_at'
    const safeSortOrder = (typeof sortOrder === 'string' && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'

    let whereClauses = []
    let queryParams = []

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`
      whereClauses.push('(s.name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)')
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    if (store_id) {
      const parsedStoreId = parseInt(store_id, 10)
      if (!isNaN(parsedStoreId)) {
        whereClauses.push('r.store_id = ?')
        queryParams.push(parsedStoreId)
      }
    }

    if (user_id) {
      const parsedUserId = parseInt(user_id, 10)
      if (!isNaN(parsedUserId)) {
        whereClauses.push('r.user_id = ?')
        queryParams.push(parsedUserId)
      }
    }

    if (rating) {
      const parsedRating = parseInt(rating, 10)
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        whereClauses.push('r.rating = ?')
        queryParams.push(parsedRating)
      }
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
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
        s.id AS store_id,
        s.name AS store_name,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      ${whereSQL}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `

    const dataQueryParams = [...queryParams, limitNum, offset]
    const [ratings] = await pool.query(dataQuery, dataQueryParams)

    res.json({
      success: true,
      ratings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get admin ratings error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving ratings for admin.' : (error.message || 'Server error retrieving ratings for admin.'),
    })
  }
}
