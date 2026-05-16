// ─────────────────────────────────────────────────────────────────────────────
// Habit tracking API routes — mounted at /api/habits by the main Express server.
//
// Database table: habits (id, user_id, sleep_hours, screen_time, physical_activity, date)
//   user_id          TEXT      — Clerk user ID or guest_ prefixed guest ID
//   sleep_hours      TEXT      — one of: '< 6', '6', '7', '8', '9+'
//   screen_time      TEXT      — one of: '< 2h', '2-4h', '4-6h', '6-8h', '8h+'
//   physical_activity BOOLEAN  — true if the user was active that day
//   date             DATE      — ISO date string (YYYY-MM-DD), one record per user per day
//
// All routes require authentication via the requireAuth middleware.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Inline wearable token middleware — verifies X-Wearable-Token header or body.token
async function requireWearableToken(req, res, next) {
  try {
    const token = req.headers['x-wearable-token'] || req.body?.token
    if (!token) return res.status(401).json({ error: 'Missing wearable token' })
    const result = await pool.query(
      'SELECT user_id FROM user_tokens WHERE token = $1',
      [token]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.userId = result.rows[0].user_id
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── GET /api/habits ──────────────────────────────────────────────────────────
// Returns all habit check-ins for the authenticated user, sorted newest-first.
// Used by:
//   - HabitTracker.jsx: to populate the history view and pre-fill today's form.
//   - Dashboard.jsx: to find whether a check-in exists for today.
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]  // $1 is a parameterised placeholder — prevents SQL injection
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/habits ─────────────────────────────────────────────────────────
// Creates a new habit check-in for the given date.
// Returns 409 Conflict if a check-in already exists for this user on that date.
// The frontend should use PUT /:date to update an existing entry.
router.post('/', requireAuth, async (req, res) => {
  try {
    const { sleep_hours, screen_time, physical_activity, date } = req.body

    // Duplicate guard: reject the insert if the user already has a record for this date.
    // This enforces the one-check-in-per-day constraint at the database query level.
    const existing = await pool.query(
      'SELECT id FROM habits WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already checked in today' })
    }

    // Insert the new row and return the complete created record (including auto-generated id).
    const result = await pool.query(
      `INSERT INTO habits (user_id, sleep_hours, screen_time, physical_activity, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, sleep_hours, screen_time, physical_activity, date]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PUT /api/habits/:date ────────────────────────────────────────────────────
// Updates the three mutable fields of an existing check-in identified by date.
// Returns 404 if no check-in exists for (req.userId, req.params.date).
// The date segment in the URL must be in 'YYYY-MM-DD' format (en-CA locale).
router.put('/:date', requireAuth, async (req, res) => {
  try {
    const { sleep_hours, screen_time, physical_activity } = req.body
    const result = await pool.query(
      `UPDATE habits SET sleep_hours=$1, screen_time=$2, physical_activity=$3
       WHERE user_id=$4 AND date=$5 RETURNING *`,
      [sleep_hours, screen_time, physical_activity, req.userId, req.params.date]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No check-in found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})


// ── POST /api/habits/wearable ─────────────────────────────────────────────────
// Receives data from an Apple Watch via the iOS Shortcuts app.
// Auth: X-Wearable-Token header (personal token from /api/tokens).
//
// Body (from Shortcut):
//   sleep_minutes   NUMBER  — minutes of sleep last night (from Apple Health)
//   steps           NUMBER  — step count today (from Apple Health)
//   date            STRING  — YYYY-MM-DD (today's date, sent by Shortcut)
//
// Mapping logic:
//   sleep_minutes → sleep_hours bucket:
//     < 360 min (6h)  → "< 6"
//     360–419         → "6"
//     420–479 (7h)    → "7"
//     480–539 (8h)    → "8"
//     540+ (9h+)      → "9+"
//
//   steps → physical_activity:
//     >= 7500 steps   → true  (WHO recommended daily activity)
//     < 7500 steps    → false
//
//   screen_time: Apple Watch cannot measure screen time — defaults to "2-4h"
//                so the record saves successfully without breaking the schema.
//                Users can manually update this in the Habit Tracker if needed.
//
// Returns 201 on create, 200 on update (if already checked in today).
router.post('/wearable', requireWearableToken, async (req, res) => {
  try {
    const { sleep_minutes, steps, date } = req.body

    if (!date) {
      return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' })
    }

    // Map sleep minutes to bucket
    const mins = Number(sleep_minutes) || 0
    let sleep_hours
    if (mins < 360)       sleep_hours = '< 6'
    else if (mins < 420)  sleep_hours = '6'
    else if (mins < 480)  sleep_hours = '7'
    else if (mins < 540)  sleep_hours = '8'
    else                  sleep_hours = '9+'

    // Map steps to activity boolean
    const physical_activity = Number(steps) >= 7500

    // Default screen_time — can be updated manually
    const screen_time = '2-4h'

    // Check if already checked in today
    const existing = await pool.query(
      'SELECT id FROM habits WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    )

    if (existing.rows.length > 0) {
      // Update existing entry
      const result = await pool.query(
        `UPDATE habits SET sleep_hours=$1, physical_activity=$2
         WHERE user_id=$3 AND date=$4 RETURNING *`,
        [sleep_hours, physical_activity, req.userId, date]
      )
      return res.json({
        status: 'updated',
        habit: result.rows[0],
        mapped: { sleep_hours, physical_activity, screen_time, sleep_minutes: mins, steps }
      })
    }

    // Create new entry
    const result = await pool.query(
      `INSERT INTO habits (user_id, sleep_hours, screen_time, physical_activity, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, sleep_hours, screen_time, physical_activity, date]
    )
    res.status(201).json({
      status: 'created',
      habit: result.rows[0],
      mapped: { sleep_hours, physical_activity, screen_time, sleep_minutes: mins, steps }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

// ── GET /api/habits/streak ───────────────────────────────────────────────────
// Calculates the current consecutive-day streak and the total lifetime check-in count.
// NOTE: This route is defined after `export default router` because it was added later.
//       Express registers it correctly because route registration happens at import time
//       before any requests are processed — the export position has no runtime effect.
//
// Algorithm:
//   1. Fetch all check-in dates for the user, sorted newest-first.
//   2. If neither today nor yesterday is checked in, streak = 0.
//   3. Otherwise, walk backwards day-by-day counting consecutive dates.
//
// Response: { streak: number, total: number }
//   streak — consecutive days ending today (or yesterday if today has no entry yet)
//   total  — all-time check-in count, used for milestone unlocking on the Progress page
router.get('/streak', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT date FROM habits WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    )

    // Normalise all dates to 'YYYY-MM-DD' strings using the Canadian locale (ISO-8601 format).
    // toLocaleDateString('en-CA') reliably produces YYYY-MM-DD without timezone drift issues.
    const dates = result.rows.map(r => new Date(r.date).toLocaleDateString('en-CA'))

    let streak = 0
    const today = new Date().toLocaleDateString('en-CA')
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')

    // Early exit: if neither today nor yesterday appears in the list,
    // the user has missed at least two days — streak must be 0.
    if (!dates.includes(today) && !dates.includes(yesterday)) {
      return res.json({ streak: 0, total: dates.length })
    }

    // Start the backwards walk from today if today is present; otherwise from yesterday.
    // This allows the streak to remain active until midnight after the last check-in day.
    let current = dates.includes(today) ? new Date() : new Date(Date.now() - 86400000)

    // Count consecutive days: each iteration checks whether the expected date is in the list,
    // then steps back by 86 400 000 ms (exactly one day).
    for (let i = 0; i < dates.length; i++) {
      const expected = current.toLocaleDateString('en-CA')
      if (dates.includes(expected)) {
        streak++
        current = new Date(current.getTime() - 86400000)  // step back one day
      } else {
        break  // first gap found — streak ends here
      }
    }

    res.json({ streak, total: dates.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
