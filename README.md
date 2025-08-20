
# 3W Round 1 — Leaderboard Claim App

Full-stack app with:
- Backend: Node + Express + MongoDB (Mongoose)
- Frontend: React (Vite)

## Quickstart (Local)
1) Backend
   ```bash
   cd backend
   cp .env.example .env       # put your MONGO_URI
   npm i
   npm run seed
   npm run dev
   ```
2) Frontend
   ```bash
   cd ../frontend
   cp .env.example .env
   npm i
   npm run dev
   ```

## Deploy
- Backend: Render/railway/vercel serverless (if Express) — expose base URL
- Frontend: Netlify/Vercel — set `VITE_API_BASE` env var

## Submission
- Frontend URL (Netlify/Vercel)
- DB Open URL (MongoDB connection string with a read/write user limited to this DB)
- Public GitHub repos (frontend + backend)
