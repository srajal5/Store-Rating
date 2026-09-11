import jwt from 'jsonwebtoken'
import { requireRole } from './roleMiddleware.js'

/**
 * Middleware to verify JWT authentication token from Authorization header.
 * Expected header format: Authorization: Bearer <token>
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please log in.',
    })
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured on server.')
    }
    const decoded = jwt.verify(token, jwtSecret)
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
