import express from 'express'
import { getOwnerDashboard, getOwnerRatings } from '../controllers/ownerController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Require authentication & STORE_OWNER role for all owner routes
router.use(authenticateToken, requireRole('STORE_OWNER'))

router.get('/dashboard', getOwnerDashboard)
router.get('/ratings', getOwnerRatings)

export default router
