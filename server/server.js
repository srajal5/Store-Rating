import app from './app.js'

const PORT = process.env.PORT || 5000

// Start server for local development
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🗄️ Database check: http://localhost:${PORT}/api/health/db`)
})
