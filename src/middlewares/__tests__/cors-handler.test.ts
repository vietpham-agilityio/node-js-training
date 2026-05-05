import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';

vi.mock('@/constants/environments.ts', () => ({
  CLIENT_URL: 'https://english-learning-platform.com',
}));

import { corsHandler } from '@/middlewares/cors-handler.ts';

const createApp = (): Application => {
  const app = express();
  app.use(corsHandler);
  app.get('/lesson', (_req, res) => res.sendStatus(200));
  return app;
};

describe('corsHandler', () => {
  let app: Application;

  beforeEach(() => {
    app = createApp();
  });

  describe('Allowed origin', () => {
    it('should set Access-Control-Allow-Origin and Vary headers', async () => {
      const res = await request(app)
        .get('/test')
        .set('Origin', 'https://english-learning-platform.com');

      expect(res.headers['access-control-allow-origin']).toBe(
        'https://english-learning-platform.com',
      );
      expect(res.headers['vary']).toBe('Origin');
    });
  });

  describe('Disallowed origin', () => {
    it('should NOT set Access-Control-Allow-Origin header', async () => {
      const res = await request(app)
        .get('/test')
        .set('Origin', 'https://english-learning.com');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
