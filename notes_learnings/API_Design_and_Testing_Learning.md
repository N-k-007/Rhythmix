# API Design & Testing: Learning Guide

This document provides a comprehensive guide to building and testing different types of APIs using a modular Express backend structure. It covers best practices for organizing code into config, controllers, middleware, models, routes, services, streaming, tests, transcoding, types, utils, and the main entry point (`index.ts`).

---

## 📁 Typical Backend Structure

```
backend/
└── src/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── streaming/
    ├── tests/
    ├── transcoding/
    ├── types/
    ├── utils/
    └── index.ts
```

---

# 1. **User Registration API**

**Use Case:** Allow new users to register with email and password.

- **Route:** `POST /api/auth/register`
- **Controller:** Validates input, calls service to create user.
- **Service:** Handles business logic, hashes password, saves user.
- **Model:** User schema (e.g., with Mongoose or Sequelize).
- **Middleware:** Input validation.
- **Test:** Checks registration with valid/invalid data.

**Example:**

```ts
// routes/auth.ts
router.post('/register', validateRegister, authController.register);

// controllers/authController.ts
export const register = async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json(user);
};

// services/authService.ts
export const registerUser = async ({ email, password }) => {
  const hash = await hashPassword(password);
  return UserModel.create({ email, password: hash });
};
```

---

# 2. **User Login & JWT Authentication API**

**Use Case:** Authenticate users and issue JWT tokens.

- **Route:** `POST /api/auth/login`
- **Controller:** Validates credentials, calls service.
- **Service:** Verifies password, issues JWT.
- **Middleware:** Input validation.
- **Test:** Checks login with correct/incorrect credentials.

**Example:**

```ts
// routes/auth.ts
router.post('/login', validateLogin, authController.login);

// controllers/authController.ts
export const login = async (req, res) => {
  const token = await authService.loginUser(req.body);
  res.json({ token });
};

// services/authService.ts
export const loginUser = async ({ email, password }) => {
  const user = await UserModel.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) throw Error('Invalid');
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
};
```

---

# 3. **Protected Profile API**

**Use Case:** Get the current user's profile (requires authentication).

- **Route:** `GET /api/users/profile`
- **Controller:** Returns user info.
- **Middleware:** JWT authentication.
- **Test:** Checks access with/without valid token.

**Example:**

```ts
// middleware/auth.ts
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// routes/users.ts
router.get('/profile', requireAuth, userController.profile);
```

---

# 4. **File Upload API**

**Use Case:** Allow users to upload files (e.g., images, documents).

- **Route:** `POST /api/files/upload`
- **Controller:** Handles file upload.
- **Middleware:** Uses `multer` for multipart/form-data.
- **Service:** Stores file info in DB.
- **Test:** Uploads a file and checks response.

**Example:**

```ts
// middleware/upload.ts
import multer from 'multer';
export const upload = multer({ dest: 'uploads/' });

// routes/files.ts
router.post('/upload', upload.single('file'), fileController.upload);

// controllers/fileController.ts
export const upload = (req, res) => {
  res.json({ filename: req.file.filename });
};
```

---

# 5. **Streaming API (Video/Audio)**

**Use Case:** Stream large media files in chunks.

- **Route:** `GET /api/stream/:filename`
- **Controller:** Handles range requests.
- **Utils:** Helper for range parsing.
- **Test:** Requests a range and checks partial content.

**Example:**

```ts
// controllers/streamController.ts
export const stream = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join('media', filename);
  const stat = fs.statSync(filePath);
  const range = req.headers.range;
  if (!range) {
    res.set('Content-Length', stat.size);
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Parse range and stream chunk
  }
};

// routes/stream.ts
router.get('/:filename', streamController.stream);
```

---

# 6. **Data Validation API**

**Use Case:** Validate incoming data (e.g., registration, forms).

- **Route:** Any route with input.
- **Middleware:** Uses `joi` or `zod` for schema validation.
- **Test:** Sends invalid/valid data and checks errors.

**Example:**

```ts
// middleware/validate.ts
import Joi from 'joi';
export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
```

---

# 7. **CRUD API for Products**

**Use Case:** Create, read, update, delete products in a store.

- **Routes:**
  - `POST /api/products` (create)
  - `GET /api/products` (list)
  - `GET /api/products/:id` (detail)
  - `PUT /api/products/:id` (update)
  - `DELETE /api/products/:id` (delete)
- **Controller:** Handles each operation.
- **Service:** Business logic for products.
- **Model:** Product schema.
- **Test:** CRUD operations.

**Example:**

```ts
// routes/products.ts
router.post('/', productController.create);
router.get('/', productController.list);
router.get('/:id', productController.detail);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

// controllers/productController.ts
export const create = async (req, res) => {
  /* ... */
};
export const list = async (req, res) => {
  /* ... */
};
// etc.
```

---

# 8. **Transcoding API (Media Conversion)**

**Use Case:** Convert uploaded media files to different formats (e.g., mp3 to wav).

- **Route:** `POST /api/transcode`
- **Controller:** Accepts file, calls transcoding service.
- **Service:** Uses `fluent-ffmpeg` or similar to convert files.
- **Test:** Uploads a file, requests conversion, checks output.

**Example:**

```ts
// services/transcodeService.ts
import ffmpeg from 'fluent-ffmpeg';
export const transcode = (inputPath, outputPath, format) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).toFormat(format).save(outputPath).on('end', resolve).on('error', reject);
  });
};

// controllers/transcodeController.ts
export const transcodeFile = async (req, res) => {
  await transcodeService.transcode(req.file.path, 'output.wav', 'wav');
  res.json({ message: 'Transcoded!' });
};
```

---

# 🧪 Testing APIs

- **Unit Tests:** Test controllers/services in isolation (e.g., with Jest).
- **Integration Tests:** Test routes end-to-end (e.g., with supertest).
- **Mocking:** Use tools like `jest.mock` to mock DB/services.
- **Example Test:**

```ts
// tests/products.test.ts
import request from 'supertest';
import app from '../index';

describe('Products API', () => {
  it('should create a product', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Test', price: 10 });
    expect(res.statusCode).toBe(201);
  });
});
```

---

# 📚 Summary Table: Example APIs

| API Type          | Route Example               | Key Concepts        |
| ----------------- | --------------------------- | ------------------- |
| User Registration | POST /api/auth/register     | Validation, Hashing |
| User Login/JWT    | POST /api/auth/login        | Auth, JWT           |
| Protected Profile | GET /api/users/profile      | Middleware, JWT     |
| File Upload       | POST /api/files/upload      | Multer, Storage     |
| Streaming         | GET /api/stream/:filename   | Range, Chunks       |
| Data Validation   | Any POST/PUT                | Joi/Zod, Middleware |
| CRUD (Products)   | /api/products (all methods) | REST, DB            |
| Transcoding       | POST /api/transcode         | FFmpeg, Media       |

---

# 📝 Best Practices

- Use controllers for request logic, services for business logic.
- Use middleware for cross-cutting concerns (auth, validation, logging).
- Keep models/types in their own folders for clarity.
- Write tests for all endpoints and edge cases.
- Use config files for environment-specific settings.
- Use utils for reusable helpers.
- Document your API endpoints and expected responses.

---

This guide is for learning and reference. Adapt the structure and examples to your own projects and use cases!

---

# 🛠️ In-Depth Example: User Login & JWT Authentication API

This section provides a complete, real-world implementation of a user login API with JWT authentication, including:

- Route
- Controller
- Service
- Middleware
- Model (User)
- Utilities (password hashing)
- Comprehensive tests (including edge cases)

## 1. **User Model (models/User.ts)**

```ts
// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string; // hashed
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model<IUser>('User', UserSchema);
```

---

## 2. **Password Utilities (utils/password.ts)**

```ts
// utils/password.ts
import bcrypt from 'bcryptjs';

export const hashPassword = async (plain: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};
```

---

## 3. **JWT Utility (utils/jwt.ts)**

```ts
// utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const signJwt = (payload: object, expiresIn = '1h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
```

---

## 4. **Login Validation Middleware (middleware/validateLogin.ts)**

```ts
// middleware/validateLogin.ts
import { Request, Response, NextFunction } from 'express';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  // Simple email format check
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  next();
};
```

---

## 5. **Auth Service (services/authService.ts)**

```ts
// services/authService.ts
import User from '../models/User';
import { comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }
  // Only include non-sensitive info in token
  const token = signJwt({ id: user._id, email: user.email });
  return { token, user: { id: user._id, email: user.email } };
};
```

---

## 6. **Auth Controller (controllers/authController.ts)**

```ts
// controllers/authController.ts
import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'User not found' || err.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};
```

---

## 7. **Route (routes/auth.ts)**

```ts
// routes/auth.ts
import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateLogin } from '../middleware/validateLogin';

const router = Router();

router.post('/login', validateLogin, login);

export default router;
```

---

## 8. **Register the Route (index.ts)**

```ts
// index.ts (main entry)
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || '', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRouter);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
```

---

## 9. **Comprehensive Tests (tests/auth.test.ts)**

```ts
// tests/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import User from '../models/User';
import { hashPassword } from '../utils/password';

describe('User Login & JWT Authentication API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany({});
    // Create a test user
    await User.create({ email: 'test@example.com', password: await hashPassword('password123') });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('should fail with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@example.com', password: 'password123' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('should fail with missing email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'password123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required.');
  });

  it('should fail with missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password are required.');
  });

  it('should fail with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notanemail', password: 'password123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid email format.');
  });

  it('should fail with short password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Password must be at least 6 characters.');
  });
});
```

---

**This example demonstrates a robust, real-world login API with JWT authentication, including validation, error handling, and comprehensive tests for all edge cases.**

---

# 🔒 Advanced Concepts: JWT Auth — Refresh Tokens, Password Reset, and Security

This section extends the User Login & JWT Authentication API with advanced features and security best practices.

## 1. **Refresh Tokens**

### Why?

- Access tokens (JWTs) should be short-lived for security.
- Refresh tokens allow users to get new access tokens without re-authenticating.

### How It Works

- On login, issue both an access token (short-lived) and a refresh token (long-lived).
- Store the refresh token securely (e.g., HTTP-only cookie or secure storage).
- When the access token expires, the client sends the refresh token to get a new access token.

### Example Implementation

**a. Update JWT Utility (utils/jwt.ts):**

```ts
// utils/jwt.ts
export const signAccessToken = (payload: object) => signJwt(payload, '15m');
export const signRefreshToken = (payload: object) => signJwt(payload, '7d');
```

**b. Update Auth Service (services/authService.ts):**

```ts
export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error('Invalid password');
  const accessToken = signAccessToken({ id: user._id, email: user.email });
  const refreshToken = signRefreshToken({ id: user._id });
  // Optionally, store refreshToken in DB for revocation
  return { accessToken, refreshToken, user: { id: user._id, email: user.email } };
};
```

**c. Add Refresh Endpoint (routes/auth.ts):**

```ts
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'No refresh token' });
  try {
    const payload = verifyJwt(refreshToken);
    const accessToken = signAccessToken({ id: payload.id, email: payload.email });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

**d. Security Tips:**

- Store refresh tokens in HTTP-only cookies or secure storage.
- Consider rotating refresh tokens and revoking on logout.
- Optionally, store refresh tokens in the database for blacklisting.

---

## 2. **Password Reset (Forgot/Reset Flow)**

### Why?

- Users need a secure way to reset forgotten passwords.

### How It Works

- User requests a password reset (provides email).
- Server generates a secure, time-limited token and emails it to the user.
- User clicks the link, submits new password with the token.
- Server verifies the token and updates the password.

### Example Implementation

**a. Generate Reset Token (services/authService.ts):**

```ts
import crypto from 'crypto';

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await hashPassword(resetToken);
  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour
  await user.save();
  // Send email with link: `/reset-password?token=${resetToken}&email=${email}`
  return resetToken;
};
```

**b. Add Fields to User Model (models/User.ts):**

```ts
resetPasswordToken?: string;
resetPasswordExpires?: number;
```

**c. Reset Password Endpoint (controllers/authController.ts):**

```ts
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  if (user.resetPasswordExpires < Date.now()) {
    return res.status(400).json({ error: 'Token expired' });
  }
  const valid = await comparePassword(token, user.resetPasswordToken);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
};
```

**d. Security Tips:**

- Always hash the reset token before storing.
- Expire tokens after a short period (e.g., 1 hour).
- Invalidate the token after use.
- Never reveal if an email exists in the system (for privacy).

---

## 3. **Advanced Security Best Practices**

- **Rate Limiting:** Prevent brute-force attacks by limiting login attempts (e.g., with `express-rate-limit`).
- **Account Lockout:** Temporarily lock accounts after repeated failed logins.
- **HTTP-only, Secure Cookies:** Store tokens in cookies with `httpOnly` and `secure` flags.
- **CORS:** Restrict allowed origins for API requests.
- **Helmet:** Use the `helmet` middleware to set secure HTTP headers.
- **Input Sanitization:** Prevent injection attacks by sanitizing all inputs.
- **Logging & Monitoring:** Log authentication events and monitor for suspicious activity.
- **2FA (Two-Factor Authentication):** Add an extra layer of security for sensitive actions.
- **Token Revocation:** Support blacklisting/whitelisting of tokens (especially refresh tokens).
- **Strong Password Policy:** Enforce minimum length, complexity, and prevent common passwords.
- **Environment Variables:** Never hardcode secrets; use environment variables for all sensitive config.

---

## 4. **Example: Rate Limiting Middleware (middleware/rateLimit.ts)**

```ts
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
});
```

**Usage in Route:**

```ts
// routes/auth.ts
import { loginLimiter } from '../middleware/rateLimit';
router.post('/login', loginLimiter, validateLogin, login);
```

---

## 5. **Summary Table: Advanced Auth Features**

| Feature          | Purpose                                 | Key Implementation Points                |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| Refresh Tokens   | Renew access tokens securely            | Issue/store/rotate, use HTTP-only cookie |
| Password Reset   | Allow users to recover accounts         | Secure tokens, expiry, email flow        |
| Rate Limiting    | Prevent brute-force attacks             | Use express-rate-limit                   |
| Account Lockout  | Block repeated failed logins            | Track attempts, lock on threshold        |
| 2FA              | Extra security for sensitive actions    | OTP/email/app-based codes                |
| Token Revocation | Invalidate tokens after logout/comprom. | Store in DB, check on use                |
| Secure Cookies   | Protect tokens from XSS                 | httpOnly, secure flags                   |
| Helmet/CORS      | Secure HTTP headers, restrict origins   | Use helmet, configure CORS               |

---

**By implementing these advanced features, you can build a secure, robust authentication system suitable for production applications.**
