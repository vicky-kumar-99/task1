
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json(users);
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const exists = await User.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ error: 'User already exists' });
    const user = await User.create({ name: name.trim() });
    await global.broadcastLeaderboard?.();
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
