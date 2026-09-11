import jwt from 'jsonwebtoken'
import { requireRole } from './roleMiddleware.js'

/**
 * Middleware to verify JWT authentication token from Authorization header.
 * Expected header format: Authorization: Bearer <token>
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please log in.',
    })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.error('Server Configuration Error: JWT_SECRET environment variable is missing.')
    return res.status(500).json({
      success: false,
      message: 'Authentication service temporarily unavailable.',
    })
  }

  try {
    // Strictly restrict allowed algorithms to HS256 to prevent algorithm confusion/downgrade
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
    })
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    })
  }
}

export { requireRole }
