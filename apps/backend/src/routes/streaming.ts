import { Router } from 'express';

const router = Router();

// Example: GET /api/streaming/
router.get('/', (req, res) => {
  res.json({ message: 'This is the streaming endpoint' });
});

export default router;
