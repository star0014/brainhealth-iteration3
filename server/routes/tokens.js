import express from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import crypto from 'crypto'

// Wearable integrations use a stable per-user token instead of Clerk auth.
// The token can be pasted into a device/script so it can submit habit data later.
const router = express.Router()

// Create the token table lazily so local demos work even if migrations have not run.
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT UNIQUE NOT NULL,
      token      TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

setTimeout(() => ensureTable().catch(console.error), 2000)

// Returns the existing token for this user, or creates one on first use.
// This keeps the token stable across page refreshes until the user regenerates it.
router.get('/', requireAuth, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT token FROM user_tokens WHERE user_id = $1',
      [req.userId]
    )
    if (existing.rows.length > 0) {
      return res.json({ token: existing.rows[0].token })
    }
    const token = crypto.randomUUID()
    await pool.query(
      'INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)',
      [req.userId, token]
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Replaces the user's wearable token.
// Old device scripts stop working after this, which is useful if a token is exposed.
router.post('/regenerate', requireAuth, async (req, res) => {
  try {
    const token = crypto.randomUUID()
    await pool.query(
      `INSERT INTO user_tokens (user_id, token)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET token = $2`,
      [req.userId, token]
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
