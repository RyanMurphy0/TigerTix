const request = require('supertest');
const app = require('../app'); // your express app

describe('LLM Booking API', () => {
  it('should parse booking request', async () => {
    const res = await request(app)
      .post('/api/llm/parse')
      .send({ message: 'Book 2 tickets for Clemson Football' });
    expect(res.statusCode).toBe(200);
    expect(res.body.parsed.tickets).toBe(2);
  });

  it('should confirm booking', async () => {
    const res = await request(app)
      .post('/api/llm/confirm')
      .send({ eventId: 1, tickets: 1, eventName: 'Clemson Football' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
