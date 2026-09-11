import express from 'express'
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from '../controllers/storeController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Public / Authenticated Store Listing and Details
router.get('/', authenticateToken, getStores)
router.get('/:id', authenticateToken, getStoreById)

// Admin-only store creation and deletion
router.post('/', authenticateToken, requireRole('ADMIN'), createStore)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteStore)

// Admin or assigned Store Owner update endpoint
router.put('/:id', authenticateToken, requireRole('ADMIN', 'STORE_OWNER'), updateStore)

export default router
