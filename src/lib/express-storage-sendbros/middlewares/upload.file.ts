import { StatusCodes } from "http-status-codes";
import { GlobalStorageConfig } from "../global.config";
import { createGoogleStyleResponse } from "../../formatter";
import { Request, Response } from 'express';
import multer from "multer";

export const uploadFileMiddleware = (req: Request, res: Response, next: Function) => {
    GlobalStorageConfig.upload.single('file')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                console.log("express-storage-sendbros: uploadFileMiddleware: err.code === 'LIMIT_FILE_SIZE'");
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