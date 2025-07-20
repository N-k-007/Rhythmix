import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'This is the users endpoint' });
});

router.get('/getAllUsers', getAllUsers);

export default router;
