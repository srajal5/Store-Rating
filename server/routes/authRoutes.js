import express from 'express'
import {
  register,
  login,
  getMe,
  changePassword,
} from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public auth endpoints
router.post('/register', register)
router.post('/login', login)

// Protected auth endpoints
router.get('/me', authenticateToken, getMe)
router.post('/change-password', authenticateToken, changePassword)

export default router
