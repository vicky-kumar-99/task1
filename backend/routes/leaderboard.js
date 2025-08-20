
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1, createdAt: 1 });
    const ranked = users.map((u, idx) => ({
      rank: idx + 1,
      _id: u._id,
      name: u.name,
      totalPoints: u.totalPoints,
    }));
    res.json(ranked);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
