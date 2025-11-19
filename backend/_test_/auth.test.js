const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

describe('Standalone Auth System Test', () => {
  let app;
  let users = [];
  const SECRET = 'testsecret123'; // temporary secret for test

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Register endpoint
    app.post('/register', (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
      if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email exists' });

      const user = { email, password };
      users.push(user);

      const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
      res.json({ token });
    });

    // Login endpoint
    app.post('/login', (req, res) => {
      const { email, password } = req.body;
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  });

  function randomEmail() {
    return `user${Math.floor(Math.random() * 100000)}@test.com`;
  }

  let testEmail;
  const testPassword = 'Test123!';

  test('Register a new user', async () => {
    testEmail = randomEmail();
    const res = await request(app)
      .post('/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login with registered user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login with wrong password fails', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: testEmail, password: 'wrongpass' });

    expect(res.status).toBe(401);
  });
});
