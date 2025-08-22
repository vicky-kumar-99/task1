
import express from 'express';
import User from '../models/User.js';
import Claim from '../models/Claim.js';

const router = express.Router();

// Claim random points for a user
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const points = Math.floor(Math.random() * 10) + 1; // 1..10
    user.totalPoints += points;
    await user.save();
    const record = await Claim.create({ userId: user._id, points });
    await global.broadcastLeaderboard?.();
    res.json({ user, points, record });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const history = await Claim.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
