import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config as dotenvConfig } from 'dotenv';
import { router as api_v1_router } from './v1/api';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {SocketManager} from './lib/socket-manager';
import path from 'path';
import fs from 'fs/promises';

// 환경 변수 설정
const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}.local`);

// 환경 변수 로드
dotenvConfig({ path: envPath });

console.log(`Running in ${NODE_ENV} mode using env file: ${envPath}`);

// Type check for required environment variables
if (!process.env.PORT || !process.env.HOST) {
  throw new Error('Required environment variables PORT and HOST must be defined');
}


console.log(process.env.FUCK)

const app: Express = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.ENDPOINT_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 3600000,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
});

// Proxy configuration 
app.set('trust proxy', false);
  
// Middleware
app.use(cors());
app.use(morgan('dev'));

// 정적 파일 제공을 위한 미들웨어 설정
app.use(express.static(path.join(__dirname, '..', 'dist')));

// async function a(){
//   const users = await getAllUsers();
//   console.log(users)
// }
// a()
// Routes

const downloadAndDeleteMiddleware = (req: Request, res: Response, next: Function) => {
  // 응답이 완료된 후 파일 삭제
  res.on('finish', async () => {
    const filePath = path.join(__dirname, '..', 'uploads', decodeURIComponent(path.basename(req.path)));
    
    try {
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (fileExists) {
        await fs.unlink(filePath);
        console.log(`파일이 성공적으로 삭제됨: ${req.path}`);
      } else {
        console.log(`파일이 이미 삭제되었거나 존재하지 않음: ${req.path}`);
      }
    } catch (err) {
      console.error(`파일 삭제 중 오류 발생: ${req.path}`, err);
    }
  });
  
  next();
};

app.use('/api/v1', api_v1_router);
app.use('/uploads', downloadAndDeleteMiddleware, express.static('uploads'));

// 모든 요청을 index.html로 리다이렉트 (SPA를 위한 설정)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start server
const PORT: number = parseInt(process.env.PORT, 10);
const HOST: string = process.env.HOST;

// Socket 초기화
SocketManager.getInstance(io);

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// For type safety, export the app instance
export default app;