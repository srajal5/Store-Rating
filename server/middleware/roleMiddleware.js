/**
 * Role-Based Access Control (RBAC) Middleware.
 * Restricts access to endpoints based on user roles.
 * Must be used AFTER authenticateToken middleware.
 *
 * @param {...string} allowedRoles - Roles permitted to access the route (e.g. 'ADMIN', 'STORE_OWNER', 'USER')
 * @returns {Function} Express middleware function
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Verify user object attached by authenticateToken
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      })
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
      })
    }

    next()
  }
}

export default requireRole
