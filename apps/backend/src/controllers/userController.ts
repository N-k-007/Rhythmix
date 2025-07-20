import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const getAllUsers = (req: Request, res: Response) => {
  try {
    const users = authService.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'An error occurred';
    res.status(500).json({ message });
  }
};
