import express from 'express'
import {
  getDashboardStats,
  getAdminUsers,
  getAdminStores,
  getAdminRatings,
} from '../controllers/adminController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Require authentication & ADMIN role for all admin routes
router.use(authenticateToken, requireRole('ADMIN'))

router.get('/dashboard', getDashboardStats)
router.get('/users', getAdminUsers)
router.get('/stores', getAdminStores)
router.get('/ratings', getAdminRatings)

export default router
