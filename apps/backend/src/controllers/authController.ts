import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { sanitizeInput, isValidUsername, isValidEmail, isValidPassword } from '../utils/validation';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  const email = sanitizeInput(req.body.email);
  const username = sanitizeInput(req.body.username);
  const password = req.body.password;

  console.log('email: ', email);
  console.log('username: ', username);

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({
      message: 'Invalid username. Use 3-20 characters (letters, numbers, underscores only).',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.',
    });
  }

  try {
    const user = await authService.register(email, username, password);
    res.status(201).json({ user });
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'An error occurred';
    res.status(400).json({ message });
  }
};
