import { Router, Request, Response } from 'express';
import {
    errorHandler,
} from '../utils/error-handler';
import { FileController } from '../controllers/file-controller';

import { validateAccessToken } from '../middlewares/access.token.validate.middleware';
import { uploadFileMiddleware } from '../../lib/express-storage-sendbros/middlewares/upload.file';
import { autoDeleteWhenErrorMiddleware } from '../../lib/express-storage-sendbros/middlewares/auto.delete.when.error';

const router = Router();

const fileController = new FileController();


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
    uploadFileMiddleware,
    errorHandler(async (req: Request, res: Response) => {
        const resp = await fileController.upload(req, res);
        const file = req.file;
        if(file) {
            autoDeleteWhenErrorMiddleware(resp, file);
        }
        return resp;
    })
);


export { router };
