import './lib/env-loader'; // 환경 변수 로드

import express, { Express } from 'express';
import { createServer } from 'http';
import cors from 'cors';

import { router as apiV1Router } from './v1/api';

import { configureMorganHttpLogger } from './lib/morgan-loader';
import { configureSpaServer } from './lib/serve-spa';
import { configureSocketManager } from './lib/socket-manager/configure';
import { configureSendbrosStorage } from './lib/express-storage-sendbros';

// Type check for required environment variables
if (!process.env.PORT || !process.env.HOST) {
  throw new Error('Required environment variables PORT and HOST must be defined');
}

const app: Express = express();
const httpServer = createServer(app);

// Proxy configuration : false
app.set('trust proxy', false);
// Middleware
app.use(cors());
// 로그 설정
configureMorganHttpLogger(app);

//api 설정
app.use('/api/v1', apiV1Router);

// Sendbrosq 핵심 storage 설정
configureSendbrosStorage(app, '/uploads', ['uploads']);

// SPA 서버 설정 (dist)
configureSpaServer(app);

// Socket 초기화
configureSocketManager(httpServer);

// Start server
const PORT: number = parseInt(process.env.PORT, 10);
const HOST: string = process.env.HOST;

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// For type safety, export the app instance
export default app;