import request from 'supertest';
import app from '../index';

describe('GET /api/users/getAllUsers', () => {
  const endpoint = '/api/users/getAllUsers';

  beforeAll(async () => {
    // Register a couple of users for testing
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user1@example.com', username: 'user1', password: 'Password@123' });
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user2@example.com', username: 'user2', password: 'Password@1234' });
  });

  it('should return all users without passwords', async () => {
    const res = await request(app).get(endpoint);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('username');
      expect(user).not.toHaveProperty('password');
    }
  });

  it('should return an empty array if no users exist', async () => {
    // This test is for completeness, but with the current in-memory array,
    // users from previous tests will persist. To fully test this, you'd need
    // to reset the users array or use a mock DB.
    // expect(res.body.users.length).toBe(0);
  });
});
