import express from 'express'
import {
  createRating,
  getStoreRatings,
  updateRating,
  deleteRating,
} from '../controllers/ratingController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Submit a store rating (Authenticated normal user)
router.post('/', authenticateToken, createRating)

// Get ratings for a store (Authenticated)
router.get('/:storeId', authenticateToken, getStoreRatings)

// Modify existing rating (Owner of rating)
router.put('/:id', authenticateToken, updateRating)

// Delete rating (Owner of rating or ADMIN)
router.delete('/:id', authenticateToken, deleteRating)

export default router
