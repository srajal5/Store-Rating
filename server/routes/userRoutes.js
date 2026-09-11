import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Admin-only user listing and user creation
router.get('/', authenticateToken, requireRole('ADMIN'), getUsers)
router.post('/', authenticateToken, requireRole('ADMIN'), createUser)

// User profile endpoints (ADMIN or authenticated self)
router.get('/:id', authenticateToken, getUserById)
router.put('/:id', authenticateToken, updateUser)

// Admin-only user deletion
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteUser)

export default router
