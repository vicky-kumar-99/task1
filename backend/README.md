
# Leaderboard Backend

## Setup
1. Copy `.env.example` to `.env` and fill `MONGO_URI` and `PORT` (optional).
2. Install deps: `npm i`
3. Seed defaults: `npm run seed`
4. Start dev: `npm run dev`  (or `npm start`)

## API
- `GET /api/users`
- `POST /api/users`  { name }
- `POST /api/claim/:userId`
- `GET /api/leaderboard`
- `GET /api/claim`  (optional `?userId=`)

## Notes
- SSE endpoint: `GET /api/events` streams leaderboard updates.
