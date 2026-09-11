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

// Disable X-Powered-By header for security
app.disable('x-powered-by')

// CORS configuration supporting local development and production Vercel deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5000',
    ]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin serverless)
      if (!origin) return callback(null, true)
      
      // Allow allowed origins or any vercel.app deployment preview/production
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body parser
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
    status: 'ok',
    success: true,
    message: 'Store Rating API is healthy and running',
    timestamp: new Date().toISOString(),
  })
})

// Database connection health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const connection = await pool.getConnection()
    await connection.query('SELECT 1 AS health_check')
    connection.release()

    res.json({
      status: 'ok',
      success: true,
      database: 'connected',
      message: 'Database connection verified successfully',
    })
  } catch (error) {
    console.error('Database health check error:', error.message)
    res.status(500).json({
      status: 'error',
      success: false,
      database: 'disconnected',
      message: 'Database connection failed',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
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

// API 404 Handler for unmatched /api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  })
})

// Global production error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error'),
  })
})

export default app
