import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
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
 * POST /api/auth/register
 * Register a new normal user ('USER')
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body

    // Field presence and type check
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password must be valid strings.',
      })
    }

    // Name length validation (20 to 60 characters)
    const trimmedName = name.trim()
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 20 and 60 characters long.',
      })
    }

    // Email format validation
    if (!validateEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    // Password complexity check
    const pwdValidationError = validatePassword(password)
    if (pwdValidationError) {
      return res.status(400).json({
        success: false,
        message: pwdValidationError,
      })
    }

    // Address length check (max 400 chars if provided)
    const formattedAddress = typeof address === 'string' ? address.trim() : null
    if (formattedAddress && formattedAddress.length > 400) {
      return res.status(400).json({
        success: false,
        message: 'Address cannot exceed 400 characters.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Default role is USER
    const userRole = 'USER'

    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [
        trimmedName,
        cleanEmail,
        hashedPassword,
        formattedAddress,
        userRole,
      ]
    )

    const userId = result.insertId

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured on server.')
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: userRole },
      jwtSecret,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name: trimmedName,
        email: cleanEmail,
        address: formattedAddress,
        role: userRole,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    })
  }
}

/**
 * POST /api/auth/login
 * User login with email & password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password must be valid strings.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, address, role FROM users WHERE email = ?',
      [cleanEmail]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const user = users[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured on server.')
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    })
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user details (protected)
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id

    const [users] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
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
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user details.',
      error: error.message,
    })
  }
}

/**
 * POST /api/auth/change-password
 * Change password for authenticated user (protected)
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const userId = req.user.id

    if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password must be valid strings.',
      })
    }

    // Validate new password requirements
    const pwdValidationError = validatePassword(newPassword)
    if (pwdValidationError) {
      return res.status(400).json({
        success: false,
        message: pwdValidationError,
      })
    }

    // Get current user password hash
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const currentHash = users[0].password

    // Verify old password
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, currentHash)
    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      })
    }

    // Hash new password
    const saltRounds = 10
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password in DB
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHashedPassword, userId]
    )

    res.json({
      success: true,
      message: 'Password updated successfully.',
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating password.',
      error: error.message,
    })
  }
}
