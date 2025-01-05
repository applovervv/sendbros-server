import path from "path";
import { Request, Response } from 'express';
import fs from 'fs/promises';

export const downloadAndDeleteMiddleware = (req: Request, res: Response, next: Function, staticStorageFolderPath: string[]) => {
    // 응답이 완료된 후 파일 삭제
    res.on('finish', async () => {
     console.log("express-storage-sendbros: downloadAndDeleteMiddleware");

      const filePath = path.join(process.cwd(), ...staticStorageFolderPath, decodeURIComponent(path.basename(req.path)));
      
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
  