import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import ratingRoutes from './routes/ratingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import ownerRoutes from './routes/ownerRoutes.js'
import { authenticateToken } from './middleware/authMiddleware.js'
import { requireRole } from './middleware/roleMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Disable X-Powered-By header for security
app.disable('x-powered-by')

// Middleware
app.use(cors())
app.use(express.json())

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/owner', ownerRoutes)

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  })
})

// Database connection health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query('SELECT 1 + 1 AS result, DATABASE() AS dbName')
    connection.release()

    res.json({
      success: true,
      message: 'Database connected successfully',
      database: rows[0].dbName || process.env.DB_NAME || 'store_rating_db',
    })
  } catch (error) {
    console.error('Database connection error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    })
  }
})

// Role authorization testing endpoints
app.get('/api/test/admin-only', authenticateToken, requireRole('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome ADMIN! Access granted to admin endpoint.',
    user: req.user,
  })
})

app.get('/api/test/owner-only', authenticateToken, requireRole('STORE_OWNER'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome STORE_OWNER! Access granted to owner endpoint.',
    user: req.user,
  })
})

app.get('/api/test/user-only', authenticateToken, requireRole('USER'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome USER! Access granted to user endpoint.',
    user: req.user,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
