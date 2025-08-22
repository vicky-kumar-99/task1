
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/users.js';
import claimRouter from './routes/claims.js';
import leaderboardRouter from './routes/leaderboard.js';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 4000;

if (!MONGO_URL) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

// Connect DB
mongoose.connect(MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  });

// API Routes
app.get('/api', (req, res) => res.json({ status: 'ok' }));
app.use('/api/users', userRouter);
app.use('/api/claim', claimRouter);
app.use('/api/leaderboard', leaderboardRouter);

let clients = [];
app.get('/api/events', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write('retry: 2000\n\n');
  const clientId = Date.now();
  clients.push({ id: clientId, res });
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

async function broadcastLeaderboard() {
  try {
    const top = await User.find().sort({ totalPoints: -1, createdAt: 1 }).limit(100).lean();
    const payload = `data: ${JSON.stringify(top)}\n\n`;
    clients.forEach(c => c.res.write(payload));
  } catch (e) {
    console.log("some error");
  }
}
global.broadcastLeaderboard = broadcastLeaderboard;

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

app.use(express.static(path.join(_dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(_dirname, "../frontend/dist/index.html"));
});


app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`)
});