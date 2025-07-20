import { User } from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const users: User[] = []; // Replace with real DB in production

export class AuthService {
  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    // Check if user exists
    if (users.find((u) => u.email === email)) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    // Remove password before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
