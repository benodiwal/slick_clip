import request from 'supertest';
import app from '../src/apps/server';
import { describe, it, expect } from '@jest/globals';

describe('GET /', () => {
  it('returns status code 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});

describe('GET /health', () => {
  it('returns status code 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
  });
});
