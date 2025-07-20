import request from 'supertest';
import express from 'express';
import helloRouter from '../routes/helloFriend';

const app = express();
app.use('/helloFriend', helloRouter);

describe('GET /helloFriend', () => {
  it('should return Hello, Friend.', async () => {
    const res = await request(app).get('/helloFriend');
    expect(res.text).toBe('Hello, Friend.');
    expect(res.statusCode).toBe(200);
  });
});
