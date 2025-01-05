import { createGoogleStyleResponse } from "../../lib/formatter";
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { JWTUtil } from "../../lib/jwt-utils";
import { StatusCodes } from "http-status-codes";
import { SocketManager } from "../../lib/socket-manager";
import { userRepository } from "../db/repositories";
import { fileRepository } from "../db/repositories/file.repo";
import { friendRepository } from "../db/repositories/friend.repo";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = Buffer.from(path.basename(file.originalname, ext), 'latin1').toString('utf8');
        const uniqueId = `__${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        cb(null, basename + uniqueId + ext);
    }
});

// 100MB 용량 제한 설정
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB in bytes
    }
});

export class FileController {
    public getMulterUpload() {
        return (req: Request, res: Response, next: Function) => {
            upload.single('file')(req, res, (err: any) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return createGoogleStyleResponse(
                            req, 
                            res, 
                            StatusCodes.BAD_REQUEST, 
                            null, 
                            "파일 크기는 100MB를 초과할 수 없습니다."
                        );
                    }
                    return createGoogleStyleResponse(
                        req, 
                        res, 
                        StatusCodes.INTERNAL_SERVER_ERROR, 
                        null, 
                        "파일 업로드 중 오류가 발생했습니다."
                    );
                }
                next();
            });
        };
    }

    async getFileTransfers(req: Request, res: Response) : Promise<Response> {
        const { username } = req.accessTokenPayload!;
        const { offset, limit } = req.query;

        const user = await userRepository.getUserByUsername(username);
        if(!user) {
            return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, null, "User not found");
        }

        const fileTransfers = await fileRepository.getFileTransfers(user.id!, Number(offset), Number(limit));

        return createGoogleStyleResponse(req, res, StatusCodes.OK, { fileTransfers }, null);
    }

    async upload(req: Request, res: Response) : Promise<Response> {
        const file = req.file;
        const { username } = req.body;

        if (!file) {
            return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, null, "파일이 없습니다.");
        }

        if(!username) {
            return createGoogleStyleResponse(req, res,  StatusCodes.BAD_REQUEST, null, "username 또는 access_token이 없습니다.");
        }

        let usernameSender = req.accessTokenPayload!.username!;

        if(usernameSender === username) {
            return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, null, "본인에게 파일을 보낼 수 없습니다.");
        }
        
        const fileUrl = `${process.env.ENDPOINT_URL}/uploads/${file.filename}`;

        const receiver = await userRepository.getUserByUsername(username);
        const sender = await userRepository.getUserByUsername(usernameSender);

        if(!receiver || !sender) {
            return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, null, "User deleted or not found");
        }

        const fileReceiveSettings = await fileRepository.getFileReceiveSettings(receiver.id!);

        if(fileReceiveSettings.receive_from === 'friends_only') {
            const isFriend = await friendRepository.isFriend(sender.id!, receiver.id!);
            
            if(!isFriend) {
                return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, null, "User is not friends");
            }
        }

        const socketIds = SocketManager.getInstance().getSocketIds(username);

        if(!socketIds || socketIds.length === 0) {
            return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, null, "User is not online");
        } 

        const FILE_DELETE_TIME = 5 * 60 * 1000;

        for(const socketId of socketIds) {
            SocketManager.getInstance().getIo().to(socketId).emit('file_data_received', {
                sender: usernameSender,
                receiver: username,
                file_url: fileUrl,
                expire_at: new Date(Date.now() + FILE_DELETE_TIME),
            });
        }

        return createGoogleStyleResponse(req, res, StatusCodes.OK, {
            fileUrl,
        }, "파일이 성공적으로 업로드되었습니다.");
    }
    
}