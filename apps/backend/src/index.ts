import express from 'express';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import playlistsRouter from './routes/playlists';
import musicRouter from './routes/music';
import streamingRouter from './routes/streaming';
import authRouter from './routes/auth';
import helloRouter from './routes/helloFriend';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(helmet());
// app.use(compression());
app.use(morgan('combined'));
// app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/helloFriend', helloRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello, Rhythmix backend!' });
});

app.use('/api/users', usersRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/music', musicRouter);
app.use('/api/streaming', streamingRouter);
app.use('/api/auth', authRouter);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
