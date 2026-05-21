# BrainBoost

BrainBoost is a FIT5120 student project focused on lifestyle-aware brain health support for university students. The app helps users reflect on sleep, screen time, physical activity, study patterns, and wellbeing through a personalised questionnaire, habit tracking, progress feedback, mini games, article recommendations, and smart reminders.

BrainBoost is an educational wellbeing prototype. It provides lifestyle awareness and habit feedback only; it is not a medical, psychological, or diagnostic tool.

## Live Project

- Frontend: deployed with Vercel
- Backend API: deployed with Railway
- Production API fallback used by the frontend: `https://brainhealth-iteration2-production.up.railway.app/api`


## Key Features

- Project access gate for FIT5120 assessment access
- Clerk authentication plus guest mode
- Guest-to-account habit migration after sign-up
- Four-question onboarding questionnaire for a personalised brain-health snapshot
- Dashboard with habit-based insights and recommendations
- Daily habit check-ins for sleep, screen time, and physical activity
- Streak and milestone progress tracking
- Mini games with score saving and leaderboards
- Article hub with personalised reading recommendations
- Smart reminders based on recent habit patterns and study context
- Data science artefacts using manual habit exports and the Zenodo SSAQS wearable dataset

## Tech Stack

- Frontend: React 19, Vite, React Router, Recharts
- Authentication: Clerk, plus local guest mode
- Backend: Node.js, Express
- Database: PostgreSQL via `pg`
- Deployment: Vercel for frontend, Railway-compatible Express server
- Data science: Python ETL scripts and Jupyter notebooks

## Repository Structure

```text
.
|-- src/                         # React frontend
|   |-- components/              # Shared UI, charts, footer, navbar, games
|   |-- data/                    # Static article and achievement data
|   |-- pages/                   # Route-level pages
|   `-- utils/                   # Auth, scoring, recommendations, display helpers
|-- server/                      # Express API server
|   |-- middleware/              # Clerk and guest authentication middleware
|   |-- routes/                  # Habits, games, token route modules
|   `-- scripts/                 # Database export helper
|-- data/
|   |-- external/                # Raw Zenodo SSAQS dataset files
|   `-- processed/               # BrainBoost-style processed dataset outputs
|-- scripts/                     # ETL script for the Zenodo SSAQS dataset
|-- public/                      # Public static assets
`-- *.ipynb                      # Data analysis and ETL notebooks
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL database connection string
- Clerk application keys

### Install Dependencies

Install frontend dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file in the repository root for the Vite frontend:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001/api
```

Create a `.env` file inside `server/` for the Express backend:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=3001
```

Do not commit real `.env` values.

### Run Locally

Run the frontend and backend together from the repository root:

```bash
npm run start
```

Or run them separately:

```bash
npm run dev
```

```bash
npm run server
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:3001/api/health`

## Available Scripts

From the repository root:

```bash
npm run dev       # Start Vite dev server
npm run server    # Start Express server from server/index.js
npm run start     # Start frontend and backend together
npm run build     # Build frontend for production
npm run preview   # Preview production frontend build
npm run lint      # Run ESLint
```

From `server/`:

```bash
npm run start     # Start Express server
npm run dev       # Start Express server in watch mode
```

## Application Routes

- `/login` - project-level access gate
- `/` - landing and home experience
- `/onboarding` - brain-health questionnaire
- `/dashboard` - personalised snapshot and insights
- `/habits` - daily check-in and habit history
- `/progress` - streaks, milestones, and game history
- `/games` - cognitive mini games
- `/articles` - article recommendations
- `/reminders` - smart reminder configuration and previews

## API Overview

The Express server is mounted under `/api`.

### Habits

- `GET /api/habits` - fetch habit check-ins for the authenticated user
- `POST /api/habits` - create a daily check-in
- `PUT /api/habits/:date` - update an existing check-in for a date
- `GET /api/habits/streak` - get current streak and total check-in count

### Games

- `POST /api/games` - save a game score
- `GET /api/games` - fetch the user's recent game scores
- `GET /api/games/leaderboard/:gameId` - fetch top scores for a game

Authentication supports either:

- Clerk JWT: `Authorization: Bearer <token>`
- Guest ID: `X-Guest-ID: guest_<id>`

## Database Tables

The app expects PostgreSQL tables similar to the following.

```sql
CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  sleep_hours TEXT NOT NULL,
  screen_time TEXT NOT NULL,
  physical_activity BOOLEAN NOT NULL,
  date DATE NOT NULL,
  UNIQUE (user_id, date)
);
```

```sql
CREATE TABLE game_scores (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  display_name TEXT,
  played_at TIMESTAMPTZ DEFAULT NOW()
);
```

`server/routes/tokens.js` also contains an experimental `user_tokens` table helper for future wearable-data integration.

## Data Science Assets

This repository includes data science support for Iteration 3:

- `BrainBoost_Iteration3_DataScience_Notebook.ipynb`
- `BrainBoost_Iteration3_Zenodo_SSAQS_ETL.ipynb`
- `scripts/etl_zenodo_ssaqs.py`
- `data/processed/zenodo_ssaqs_daily_brainboost.csv`
- `data/processed/zenodo_ssaqs_etl_summary.json`

The ETL workflow transforms the Zenodo SSAQS dataset into daily BrainBoost-style fields such as sleep score, steps, active minutes, HRV, oxygen, stress/anxiety signals, physical activity status, and smart reminder candidate flags.

Run the ETL script from the repository root:

```bash
python scripts/etl_zenodo_ssaqs.py
```

Current processed output summary:

- Source: Zenodo record 18706837 - SSAQS dataset
- Participants found: 35
- Daily rows written: 3616

## Deployment Notes

### Frontend

The frontend can be deployed to Vercel. `vercel.json` rewrites all routes to `index.html` so React Router routes work on refresh.

Required Vercel environment variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=https://your-backend-domain/api
```

### Backend

The backend is Railway-compatible. Railway injects `PORT`, so the server uses:

```js
const PORT = process.env.PORT || 3001
```

Required backend environment variables:

```env
DATABASE_URL=your_postgres_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

When adding new frontend domains, update the `allowedOrigins` list in `server/index.js`.

## Privacy and Safety

BrainBoost uses habit ranges and lightweight wellbeing signals to personalise app feedback. It should avoid diagnostic language, raw sensitive data exposure, or claims that imply clinical judgement. Users with serious sleep, stress, mental health, or medical concerns should seek qualified support.
