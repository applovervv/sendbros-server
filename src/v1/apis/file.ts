import { Router, Request, Response } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';
import {
    errorHandler,
} from '../utils/error-handler';
import { FileController } from '../controllers/file-controller';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs/promises';

import { validateAccessToken } from '../middlewares/access.token.validate.middleware';

const router = Router();

const fileController = new FileController();

const FILE_DELETE_TIME = 5 * 60 * 1000; // 5분

/*
[파일 전송 목록 조회]
GET api/v1/files

Request Type (요청 타입):


{
    offset: number;
    limit: number;
}

header:
{
    Authorization: Bearer ${accessToken};
}
    
Return Type (응답 타입):
{
  fileTransfers: Array<{
    id: number;          // 파일 전송 ID
    sender_id: number;   // 보낸 사용자 ID
    receiver_id: number; // 받은 사용자 ID
    file_name: string;   // 파일 이름
    created_at: string;  // 생성일
  }>
}
*/
router.get(
  '/',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await fileController.getFileTransfers(req, res);
  })
);

/*

POSt /api/v1/file/upload
*/

router.post('/upload', 
    validateAccessToken,
    fileController.getMulterUpload(),
    errorHandler(async (req: Request, res: Response) => {
        const resp = await fileController.upload(req, res);
        const file = req.file;
        
        if(resp.statusCode !== StatusCodes.OK) {
            console.log(`파일 not ok ${resp.statusCode}`);
            // 파일 삭제
            if(file) {
                console.log(`파일 삭제 시도: ${file.path}`);
                try {
                     fs.unlink(file.path);
                } catch (error: any) {
                    // ENAMETOOLONG 에러 처리
                    if (error.code === 'ENAMETOOLONG') {
                        console.log('파일 이름이 너무 길어서 일반적인 방법으로 삭제 불가');
                        const Buffer = require('buffer').Buffer;
                        const path = Buffer.from(file.path);
                        fs.unlink(path);
                    } else {
                        throw error;
                    }
                }
            }
        } else {
            // 파일 업로드 성공 시 5분 후 자동 삭제
            if(file) {
                setTimeout(async () => {
                    try {
                        await fs.unlink(file.path);
                        console.log(`파일 자동 삭제 완료: ${file.path}`);
                    } catch (error: any) {
                        if (error.code === 'ENAMETOOLONG') {
                            console.log('파일 이름이 너무 길어서 일반적인 방법으로 삭제 불가');
                            const Buffer = require('buffer').Buffer;
                            const path = Buffer.from(file.path);
                            await fs.unlink(path);
                        } else {
                            console.error(`파일 자동 삭제 실패: ${error.message}`);
                        }
                    }
                }, FILE_DELETE_TIME); // 5분
            }
        }
        return resp;
    })
);


export { router };
