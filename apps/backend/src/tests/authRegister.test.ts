import request from 'supertest';
import app from '../index';

describe('POST /api/auth/register', () => {
  const endpoint = '/api/auth/register';

  it('should register a new user successfully', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'TestPassword@123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('testuser@example.com');
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should not allow registration with missing email', async () => {
    const res = await request(app).post(endpoint).send({ username: 'user2', password: 'pass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing required fields/i);
  });

  it('should not allow registration with missing username', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: 'user2@example.com', password: 'pass' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing required fields/i);
  });

  it('should not allow registration with missing password', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ email: 'user3@example.com', username: 'user3' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing required fields/i);
  });

  it('should not allow duplicate email registration', async () => {
    // First registration
    await request(app).post(endpoint).send({
      email: 'duplicate@example.com',
      username: 'dupuser',
      password: 'dupPassword@123',
    });
    // Attempt duplicate
    const res = await request(app).post(endpoint).send({
      email: 'duplicate@example.com',
      username: 'dupuser2',
      password: 'dupPassword@1234',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should not allow invalid email format', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'not-an-email',
      username: 'bademail',
      password: 'passwordd',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid email address./i);
  });

  it('should not allow short passwords', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'shortpass@example.com',
      username: 'shortpass',
      password: '1',
    });
    expect(res.status).toBe(400);
  });

  it('should not allow password less than 6 characters', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'shortpass@example.com',
      username: 'shortpass',
      password: '12345',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(
      /Password must be at least 8 characters long, include uppercase, lowercase, number, and special character./i,
    );
  });

  it('should not allow password greater than 10 characters', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'shortpass@example.com',
      username: 'shortpass',
      password: '1234567891234omekceoefmefkm',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(
      /Password must be at least 8 characters long, include uppercase, lowercase, number, and special character./i,
    );
  });

  it('should trim whitespace in email and username', async () => {
    const res = await request(app).post(endpoint).send({
      email: '  spaced@example.com  ',
      username: '  spaceduser  ',
      password: 'Password@123',
    });
    expect(res.status).toBe(201);
  });
});
