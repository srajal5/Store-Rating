import pool from '../config/db.js'

// Helper function to validate email format
const validateEmail = (email) => {
  if (typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * GET /api/stores
 * List all stores with SQL aggregated average ratings, total ratings, search, sorting, and pagination.
 */
export const getStores = async (req, res) => {
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

    // Parse and sanitize pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
    const offset = (pageNum - 1) * limitNum

    // Whitelist allowed sort columns
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

    // Count total matching stores
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total 
      FROM stores s 
      ${whereSQL}
    `
    const [countRows] = await pool.query(countQuery, queryParams)
    const total = countRows[0].total
    const totalPages = Math.ceil(total / limitNum) || 1

    const userId = req.user ? parseInt(req.user.id, 10) : null

    // Main SQL query with SQL aggregation for average rating & total rating count
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
        COUNT(r.id) AS total_ratings,
        ${userId ? '(SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ' + userId + ' LIMIT 1)' : 'NULL'} AS user_rating
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
    console.error('Get stores error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving stores.' : (error.message || 'Server error retrieving stores.'),
    })
  }
}

/**
 * GET /api/stores/:id
 * Get single store by ID with average rating and total ratings.
 */
export const getStoreById = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10)
    if (isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format.',
      })
    }

    const query = `
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
      WHERE s.id = ?
      GROUP BY s.id, u.id
    `

    const [stores] = await pool.query(query, [storeId])

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      })
    }

    res.json({
      success: true,
      store: stores[0],
    })
  } catch (error) {
    console.error('Get store by ID error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving store details.' : (error.message || 'Server error retrieving store details.'),
    })
  }
}

/**
 * POST /api/stores
 * Create a new store (ADMIN only).
 */
export const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body

    // Basic type & presence checks
    if (typeof name !== 'string' || typeof email !== 'string' || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Store name, email, and address are required and must be valid strings.',
      })
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 1 || trimmedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Store name must be between 1 and 60 characters long.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid store email address.',
      })
    }

    const trimmedAddress = address.trim()
    if (trimmedAddress.length < 1 || trimmedAddress.length > 400) {
      return res.status(400).json({
        success: false,
        message: 'Store address must be between 1 and 400 characters long.',
      })
    }

    const parsedOwnerId = parseInt(owner_id, 10)
    if (isNaN(parsedOwnerId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid owner_id is required.',
      })
    }

    // Verify owner user exists AND has STORE_OWNER role
    const [owners] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [parsedOwnerId]
    )

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'The specified owner user does not exist.',
      })
    }

    if (owners[0].role !== 'STORE_OWNER') {
      return res.status(400).json({
        success: false,
        message: 'Stores can only be assigned to users with the STORE_OWNER role.',
      })
    }

    // Check store email uniqueness
    const [existingStore] = await pool.query('SELECT id FROM stores WHERE email = ?', [cleanEmail])
    if (existingStore.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.',
      })
    }

    // Insert store into database
    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [trimmedName, cleanEmail, trimmedAddress, parsedOwnerId]
    )

    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      store: {
        id: result.insertId,
        name: trimmedName,
        email: cleanEmail,
        address: trimmedAddress,
        owner_id: parsedOwnerId,
        owner_name: owners[0].name,
      },
    })
  } catch (error) {
    console.error('Create store error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error creating store.' : (error.message || 'Server error creating store.'),
    })
  }
}

/**
 * PUT /api/stores/:id
 * Update store details (ADMIN or assigned STORE_OWNER).
 */
export const updateStore = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10)
    if (isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format.',
      })
    }

    // Check store existence
    const [existingStores] = await pool.query('SELECT * FROM stores WHERE id = ?', [storeId])
    if (existingStores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      })
    }

    const currentStore = existingStores[0]
    const isAdmin = req.user.role === 'ADMIN'
    const isOwner = req.user.role === 'STORE_OWNER' && req.user.id === currentStore.owner_id

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this store.',
      })
    }

    const { name, email, address, owner_id } = req.body

    let updateFields = []
    let queryParams = []

    // Store Name
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 60) {
        return res.status(400).json({
          success: false,
          message: 'Store name must be between 1 and 60 characters long.',
        })
      }
      updateFields.push('name = ?')
      queryParams.push(name.trim())
    }

    // Store Email
    if (email !== undefined) {
      if (typeof email !== 'string' || !validateEmail(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid store email address.',
        })
      }
      const cleanEmail = email.trim().toLowerCase()
      // Check duplicate store email
      const [emailCheck] = await pool.query('SELECT id FROM stores WHERE email = ? AND id != ?', [cleanEmail, storeId])
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Store email address is already in use by another store.',
        })
      }
      updateFields.push('email = ?')
      queryParams.push(cleanEmail)
    }

    // Store Address
    if (address !== undefined) {
      if (typeof address !== 'string' || address.trim().length < 1 || address.trim().length > 400) {
        return res.status(400).json({
          success: false,
          message: 'Store address must be between 1 and 400 characters long.',
        })
      }
      updateFields.push('address = ?')
      queryParams.push(address.trim())
    }

    // Store Owner ID (ADMIN only)
    if (owner_id !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can reassign store ownership.',
        })
      }

      const parsedOwnerId = parseInt(owner_id, 10)
      if (isNaN(parsedOwnerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid owner_id format.',
        })
      }

      const [owners] = await pool.query(
        'SELECT id, role FROM users WHERE id = ?',
        [parsedOwnerId]
      )

      if (owners.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'The specified owner user does not exist.',
        })
      }

      if (owners[0].role !== 'STORE_OWNER') {
        return res.status(400).json({
          success: false,
          message: 'Stores can only be assigned to users with the STORE_OWNER role.',
        })
      }

      updateFields.push('owner_id = ?')
      queryParams.push(parsedOwnerId)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
      })
    }

    queryParams.push(storeId)

    await pool.query(
      `UPDATE stores SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    )

    // Fetch updated store with details
    const getUpdatedQuery = `
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
      WHERE s.id = ?
      GROUP BY s.id, u.id
    `

    const [updatedStores] = await pool.query(getUpdatedQuery, [storeId])

    res.json({
      success: true,
      message: 'Store updated successfully.',
      store: updatedStores[0],
    })
  } catch (error) {
    console.error('Update store error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error updating store.' : (error.message || 'Server error updating store.'),
    })
  }
}

/**
 * DELETE /api/stores/:id
 * Delete a store (ADMIN only).
 */
export const deleteStore = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10)
    if (isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format.',
      })
    }

    const [existing] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      })
    }

    await pool.query('DELETE FROM stores WHERE id = ?', [storeId])

    res.json({
      success: true,
      message: 'Store deleted successfully.',
    })
  } catch (error) {
    console.error('Delete store error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error deleting store.' : (error.message || 'Server error deleting store.'),
    })
  }
}
