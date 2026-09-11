import bcrypt from 'bcrypt'
import pool from '../config/db.js'

// Helper function to validate password complexity
const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.'
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.'
  }
  return null
}

// Helper function to validate email format
const validateEmail = (email) => {
  if (typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * GET /api/users
 * List users with Search, Filtering, Sorting, and Pagination (ADMIN only)
 */
export const getUsers = async (req, res) => {
  try {
    const {
      search,
      name,
      email,
      address,
      role,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query

    // Parse and sanitize pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
    const offset = (pageNum - 1) * limitNum

    // Whitelist allowed sort columns to prevent SQL injection
    const allowedSortColumns = ['id', 'name', 'email', 'address', 'role', 'created_at', 'updated_at']
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at'

    // Whitelist allowed sort order
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    // Build SQL query dynamically with parameterized values
    let whereClauses = []
    let queryParams = []

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`
      whereClauses.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)')
      queryParams.push(searchPattern, searchPattern, searchPattern)
    }

    if (name && typeof name === 'string' && name.trim() !== '') {
      whereClauses.push('name LIKE ?')
      queryParams.push(`%${name.trim()}%`)
    }

    if (email && typeof email === 'string' && email.trim() !== '') {
      whereClauses.push('email LIKE ?')
      queryParams.push(`%${email.trim()}%`)
    }

    if (address && typeof address === 'string' && address.trim() !== '') {
      whereClauses.push('address LIKE ?')
      queryParams.push(`%${address.trim()}%`)
    }

    if (role && typeof role === 'string' && role.trim() !== '') {
      const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER']
      const formattedRole = role.trim().toUpperCase()
      if (allowedRoles.includes(formattedRole)) {
        whereClauses.push('role = ?')
        queryParams.push(formattedRole)
      }
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Count total matching records for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM users ${whereSQL}`
    const [countRows] = await pool.query(countQuery, queryParams)
    const total = countRows[0].total
    const totalPages = Math.ceil(total / limitNum) || 1

    // Main query for fetching users (EXCLUDING password field)
    const dataQuery = `
      SELECT id, name, email, address, role, created_at, updated_at 
      FROM users 
      ${whereSQL} 
      ORDER BY ${safeSortBy} ${safeSortOrder} 
      LIMIT ? OFFSET ?
    `

    // Add numeric limit and offset to parameters
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
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving users.' : (error.message || 'Server error retrieving users.'),
    })
  }
}

/**
 * GET /api/users/:id
 * Fetch single user profile by ID (ADMIN or profile owner)
 */
export const getUserById = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10)
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      })
    }

    // Check authorization: ADMIN or self
    if (req.user.role !== 'ADMIN' && req.user.id !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only view your own profile.',
      })
    }

    const [users] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [targetUserId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    res.json({
      success: true,
      user: users[0],
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving user details.' : (error.message || 'Server error retrieving user details.'),
    })
  }
}

/**
 * POST /api/users
 * Create a user directly (ADMIN only)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'USER' } = req.body

    // Validation
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password must be valid strings.',
      })
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 20 and 60 characters long.',
      })
    }

    if (!validateEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    const pwdValidationError = validatePassword(password)
    if (pwdValidationError) {
      return res.status(400).json({
        success: false,
        message: pwdValidationError,
      })
    }

    const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER']
    const formattedRole = typeof role === 'string' ? role.trim().toUpperCase() : 'USER'
    if (!allowedRoles.includes(formattedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles: ADMIN, USER, STORE_OWNER.',
      })
    }

    const formattedAddress = typeof address === 'string' ? address.trim() : null
    if (formattedAddress && formattedAddress.length > 400) {
      return res.status(400).json({
        success: false,
        message: 'Address cannot exceed 400 characters.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail])
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, cleanEmail, hashedPassword, formattedAddress, formattedRole]
    )

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        name: trimmedName,
        email: cleanEmail,
        address: formattedAddress,
        role: formattedRole,
      },
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error creating user.' : (error.message || 'Server error creating user.'),
    })
  }
}

/**
 * PUT /api/users/:id
 * Update user details (ADMIN or profile owner)
 */
export const updateUser = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10)
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      })
    }

    const isSelf = req.user.id === targetUserId
    const isAdmin = req.user.role === 'ADMIN'

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own profile.',
      })
    }

    // Fetch target user
    const [existing] = await pool.query('SELECT id, role, password FROM users WHERE id = ?', [targetUserId])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const { name, email, address, role, password } = req.body

    let updateFields = []
    let queryParams = []

    // Name update
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 20 and 60 characters long.',
        })
      }
      updateFields.push('name = ?')
      queryParams.push(name.trim())
    }

    // Email update
    if (email !== undefined) {
      if (typeof email !== 'string' || !validateEmail(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        })
      }
      const cleanEmail = email.trim().toLowerCase()
      // Check if email is used by another user
      const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [cleanEmail, targetUserId])
      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already in use by another user.',
        })
      }
      updateFields.push('email = ?')
      queryParams.push(cleanEmail)
    }

    // Address update
    if (address !== undefined) {
      const formattedAddress = typeof address === 'string' ? address.trim() : null
      if (formattedAddress && formattedAddress.length > 400) {
        return res.status(400).json({
          success: false,
          message: 'Address cannot exceed 400 characters.',
        })
      }
      updateFields.push('address = ?')
      queryParams.push(formattedAddress)
    }

    // Role update (ADMIN only)
    if (role !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can change user roles.',
        })
      }
      const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER']
      const formattedRole = typeof role === 'string' ? role.trim().toUpperCase() : ''
      if (!allowedRoles.includes(formattedRole)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified.',
        })
      }
      updateFields.push('role = ?')
      queryParams.push(formattedRole)
    }

    // Optional password update
    if (password !== undefined && password !== '') {
      const pwdValidationError = validatePassword(password)
      if (pwdValidationError) {
        return res.status(400).json({
          success: false,
          message: pwdValidationError,
        })
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      updateFields.push('password = ?')
      queryParams.push(hashedPassword)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
      })
    }

    queryParams.push(targetUserId)

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    )

    // Return updated user object
    const [updatedUsers] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [targetUserId]
    )

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUsers[0],
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error updating user.' : (error.message || 'Server error updating user.'),
    })
  }
}

/**
 * DELETE /api/users/:id
 * Delete user account (ADMIN only)
 */
export const deleteUser = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10)
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.',
      })
    }

    // Prevent self-deletion of admin account if desired
    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own account.',
      })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [targetUserId])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    await pool.query('DELETE FROM users WHERE id = ?', [targetUserId])

    res.json({
      success: true,
      message: 'User deleted successfully.',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error deleting user.' : (error.message || 'Server error deleting user.'),
    })
  }
}
