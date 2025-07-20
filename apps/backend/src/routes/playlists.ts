import { Router } from 'express';

const router = Router();

// Example: GET /api/playlists/
router.get('/', (req, res) => {
  res.json({ message: 'This is the playlists endpoint' });
});

export default router;
