import { createGoogleStyleResponse } from "../../lib/formatter";
import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import { SocketManager } from "../../lib/socket-manager";
import { userRepository } from "../db/repositories";
import { fileRepository } from "../db/repositories/file.repo";
import { friendRepository } from "../db/repositories/friend.repo";
import { GlobalStorageConfig } from "../../lib/express-storage-sendbros/global.config";

export class FileController {
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
        
        const fileUrl = GlobalStorageConfig.getStaticStorageFileUrl(file.filename);

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

        const expireAt = new Date(Date.now() + GlobalStorageConfig.FILE_DELETE_TIME);

        for(const socketId of socketIds) {
            SocketManager.getInstance().getIo().to(socketId).emit('file_data_received', {
                sender: usernameSender,
                receiver: username,
                file_url: fileUrl,
                expire_at: expireAt,
            });
        }

        return createGoogleStyleResponse(req, res, StatusCodes.OK, {
            fileUrl,
            expire_at: expireAt,
        }, "파일이 성공적으로 업로드되었습니다.");
    }
    
}