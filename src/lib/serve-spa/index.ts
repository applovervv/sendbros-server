import express, { Express, Request, Response } from 'express';
import path from 'path';

export const configureSpaServer = (app: Express) => {
  // React 빌드 파일의 절대 경로 설정
  const distPath = path.join(process.cwd(), 'dist');
  
  // React 빌드 파일을 제공하기 위한 정적 파일 설정
  app.use(express.static(distPath));

  // SPA의 클라이언트 사이드 라우팅을 위한 설정
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
};