import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import fs from 'fs/promises';
import { GlobalStorageConfig } from "../global.config";
import { Buffer } from 'buffer';

async function deleteFile(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath);
        console.log(`파일 삭제 완료: ${filePath}`);
    } catch (error: any) {
        if (error.code === 'ENAMETOOLONG') {
            console.log('파일 이름이 너무 길어서 Buffer로 변환하여 삭제 시도');
            const pathBuffer = Buffer.from(filePath);
            await fs.unlink(pathBuffer);
        } else {
            throw error;
        }
    }
}

export const autoDeleteWhenErrorMiddleware = async (resp: Response, file: Express.Multer.File) => {
    if (!file) return;

    if (resp.statusCode !== StatusCodes.OK) {
        console.log(`파일 상태 에러 (${resp.statusCode}), 즉시 삭제`);
        try {
            await deleteFile(file.path);
        } catch (error) {
            console.error('파일 삭제 실패:', error);
        }
    } else {
        console.log(`파일 업로드 성공, ${GlobalStorageConfig.FILE_DELETE_TIME}ms 후 자동 삭제 예약`);
        setTimeout(async () => {
            try {
                await deleteFile(file.path);
            } catch (error) {
                console.error('파일 자동 삭제 실패:', error);
            }
        }, GlobalStorageConfig.FILE_DELETE_TIME);
    }
};