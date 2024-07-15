import request from 'supertest';
import path from 'path';
import { execSync } from 'child_process';
import { unlinkSync, existsSync } from 'fs';
import Server from '../src/apps/server';
import Database from '../src/apps/database';
import { beforeAll, afterAll, describe, expect, it } from '@jest/globals';

let server: Server;
let baseUrl: string;
let userToken: string;
let userId: string;

beforeAll(async () => {
  process.env['DATABASE_URL'] = 'file:./slick_clip_test.db';

  execSync('npx prisma migrate dev', {
    env: {
      ...process.env,
      DATABASE_URL: process.env['DATABASE_URL'],
    },
  });

  const database = new Database();
  server = new Server(database);
  server.start();
  baseUrl = 'http://localhost:8000';

  const userRes = await request(baseUrl)
    .post('/user')
    .send({ username: 'videotestuser' });
  userToken = userRes.body.apiToken;
  userId = userRes.body.id;
});

afterAll(async () => {
  const dbFilePath = './slick_clip_test.db';
  if (existsSync(dbFilePath)) {
    unlinkSync(dbFilePath);
  }
});

describe('Health Check', () => {
  it('should respond to health check', async () => {
    const res = await request(baseUrl).get('/health');
    expect(res.status).toEqual(200);
  });
});

describe('User API', () => {
  it('should create a new user', async () => {
    const res = await request(baseUrl)
      .post('/user')
      .send({
        username: 'testuser1',
      });
    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'testuser1');
    expect(res.body).toHaveProperty('apiToken');
  });

  it('should return 400 for creating a user with existing username', async () => {
    await request(baseUrl)
      .post('/user')
      .send({
        username: 'duplicateuser',
      });

    const res = await request(baseUrl)
      .post('/user')
      .send({
        username: 'duplicateuser',
      });
    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Username already exists');
  });

  it('should return 400 for creating a user without username', async () => {
    const res = await request(baseUrl)
      .post('/user')
      .send({});
    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Username is required');
  });

  it('should get a user by ID', async () => {
    const userRes = await request(baseUrl)
      .post('/user')
      .send({
        username: 'testuser2',
      });

    const userId = userRes.body.id;

    const res = await request(baseUrl).get(`/user/${userId}`);
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('username', 'testuser2');
  });

  it('should return 404 for getting a non-existing user', async () => {
    const res = await request(baseUrl).get('/user/nonexistingid');
    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });
});

describe('Video API', () => {
  it('should upload a new video', async () => {
    const res = await request(baseUrl)
      .post('/videos/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'test_video.mp4')); // Adjust the path to your test video
    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('filePath');
    expect(res.body).toHaveProperty('size');
    expect(res.body).toHaveProperty('duration');
    expect(res.body).toHaveProperty('userId', userId);
  });

  it('should return 400 for uploading without a file', async () => {
    const res = await request(baseUrl)
      .post('/videos/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .send();
    expect(res.status).toEqual(400);
    expect(res.body).toHaveProperty('error', 'File not found');
  });

  it('should return 403 for unauthorized video upload', async () => {
    const res = await request(baseUrl)
      .post('/videos/upload')
      .send();
    expect(res.status).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should trim a video', async () => {
    const uploadRes = await request(baseUrl)
      .post('/videos/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'test_video.mp4'));

    const videoId = uploadRes.body.id;

    const trimRes = await request(baseUrl)
      .post(`/videos/${videoId}/trim`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ start: 1, end: 5 });

    expect(trimRes.status).toEqual(200);
    expect(trimRes.body).toHaveProperty('id');
    expect(trimRes.body).toHaveProperty('title');
    expect(trimRes.body).toHaveProperty('filePath');
    expect(trimRes.body).toHaveProperty('size');
    expect(trimRes.body).toHaveProperty('duration');
    expect(trimRes.body.duration).toBeLessThan(uploadRes.body.duration);
  });

  it('should return 400 for trimming with invalid time', async () => {
    const uploadRes = await request(baseUrl)
      .post('/videos/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'test_video.mp4'));

    const videoId = uploadRes.body.id;

    const trimRes = await request(baseUrl)
      .post(`/videos/${videoId}/trim`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ start: -1, end: 5 });

    expect(trimRes.status).toEqual(400);
    expect(trimRes.body).toHaveProperty('error', 'Start must not be negative');
  });

  it('should return 404 for trimming a non-existing video', async () => {
    const res = await request(baseUrl)
      .post('/videos/nonexistingid/trim')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ start: 1, end: 5 });
    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Video not found');
  });

  it('should delete a video', async () => {
    const uploadRes = await request(baseUrl)
      .post('/videos/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', path.join(__dirname, 'test_video.mp4'));

    const videoId = uploadRes.body.id;

    const deleteRes = await request(baseUrl)
      .delete(`/videos/${videoId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.status).toEqual(204);
  });

  it('should return 404 for deleting a non-existing video', async () => {
    const res = await request(baseUrl)
      .delete('/videos/nonexistingid')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Video not found');
  });

});
