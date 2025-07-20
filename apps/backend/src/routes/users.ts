import { Router } from 'express';

const router = Router();

// Example: GET /api/users/
router.get('/', (req, res) => {
  res.json({ message: 'This is the users endpoint' });
});

export default router;
