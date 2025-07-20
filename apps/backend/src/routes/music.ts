import { Router } from 'express';

const router = Router();

// Example: GET /api/music/
router.get('/', (req, res) => {
  res.json({ message: 'This is the music endpoint' });
});

export default router;
