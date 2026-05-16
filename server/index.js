import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import habitRoutes from './routes/habits.js'
import gameRoutes from './routes/games.js'
import tokenRoutes from './routes/tokens.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://iteration2.ta31brainboost.me',
  'https://iteration3.ta31brainboost.me',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  }
}))

app.use(express.json())

app.use('/api/habits', habitRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/tokens', tokenRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
