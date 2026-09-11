import pool from '../config/db.js'

export const createRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body
    const userId = req.user.id

    if (req.user.role !== 'USER') {
      return res.status(403).json({
        success: false,
        message: 'Only registered normal users can submit store ratings.',
      })
    }

    const parsedStoreId = parseInt(store_id, 10)
    if (isNaN(parsedStoreId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store_id format.',
      })
    }

    const parsedRating = parseInt(rating, 10)
    if (isNaN(parsedRating) || !Number.isInteger(Number(rating)) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer value between 1 and 5.',
      })
    }

    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [parsedStoreId])
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      })
    }

    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, parsedStoreId]
    )

    let ratingId
    let isUpdated = false

    if (existing.length > 0) {
      ratingId = existing[0].id
      await pool.query('UPDATE ratings SET rating = ? WHERE id = ?', [parsedRating, ratingId])
      isUpdated = true
    } else {
      const [result] = await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, parsedStoreId, parsedRating]
      )
      ratingId = result.insertId
    }

    const [savedRating] = await pool.query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE id = ?',
      [ratingId]
    )

    res.status(isUpdated ? 200 : 201).json({
      success: true,
      message: isUpdated ? 'Rating updated successfully.' : 'Rating submitted successfully.',
      rating: savedRating[0],
    })
  } catch (error) {
    console.error('Create rating error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error submitting rating.' : (error.message || 'Server error submitting rating.'),
    })
  }
}

export const getStoreRatings = async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId, 10)
    if (isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID format.',
      })
    }

    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId])
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      })
    }

    const ratingsQuery = `
      SELECT 
        r.id,
        r.user_id,
        r.store_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.name AS user_name,
        u.email AS user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `
    const [ratings] = await pool.query(ratingsQuery, [storeId])

    const statsQuery = `
      SELECT 
        COALESCE(ROUND(AVG(rating), 2), 0) AS average_rating,
        COUNT(id) AS total_ratings
      FROM ratings
      WHERE store_id = ?
    `
    const [statsRows] = await pool.query(statsQuery, [storeId])

    let userRating = null
    if (req.user) {
      const userRatingMatch = ratings.find((r) => r.user_id === req.user.id)
      if (userRatingMatch) {
        userRating = userRatingMatch
      }
    }

    res.json({
      success: true,
      store: stores[0],
      stats: {
        average_rating: Number(statsRows[0].average_rating),
        total_ratings: Number(statsRows[0].total_ratings),
      },
      userRating,
      ratings,
    })
  } catch (error) {
    console.error('Get store ratings error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error retrieving store ratings.' : (error.message || 'Server error retrieving store ratings.'),
    })
  }
}

export const updateRating = async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id, 10)
    if (isNaN(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format.',
      })
    }

    const { rating } = req.body
    const parsedRating = parseInt(rating, 10)
    if (isNaN(parsedRating) || !Number.isInteger(Number(rating)) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer value between 1 and 5.',
      })
    }

    const [existing] = await pool.query('SELECT * FROM ratings WHERE id = ?', [ratingId])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found.',
      })
    }

    const currentRating = existing[0]

    if (currentRating.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only modify your own ratings.',
      })
    }

    await pool.query('UPDATE ratings SET rating = ? WHERE id = ?', [parsedRating, ratingId])

    const [updated] = await pool.query('SELECT * FROM ratings WHERE id = ?', [ratingId])

    res.json({
      success: true,
      message: 'Rating updated successfully.',
      rating: updated[0],
    })
  } catch (error) {
    console.error('Update rating error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error updating rating.' : (error.message || 'Server error updating rating.'),
    })
  }
}

export const deleteRating = async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id, 10)
    if (isNaN(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format.',
      })
    }

    const [existing] = await pool.query('SELECT * FROM ratings WHERE id = ?', [ratingId])
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found.',
      })
    }

    const currentRating = existing[0]
    const isOwner = currentRating.user_id === req.user.id
    const isAdmin = req.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only delete your own ratings.',
      })
    }

    await pool.query('DELETE FROM ratings WHERE id = ?', [ratingId])

    res.json({
      success: true,
      message: 'Rating deleted successfully.',
    })
  } catch (error) {
    console.error('Delete rating error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error deleting rating.' : (error.message || 'Server error deleting rating.'),
    })
  }
}
