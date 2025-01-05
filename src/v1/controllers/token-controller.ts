import { tokenRepository } from '../db/repositories';
import { Request, Response } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { StatusCodes } from 'http-status-codes';
import { JWTUtil } from '../../lib/jwt-utils';

export class TokenController {
    async reissue(req: Request, res: Response) : Promise<Response> {
        const refreshToken = req.refreshToken!;
        const refreshTokenPayload = req.refreshTokenPayload!;
        const {userId, username} = refreshTokenPayload;
    
        // DB에서 리프레시 토큰 확인
        const storedToken = await tokenRepository.findRefreshToken(refreshToken);
        
        if (!storedToken) {
            return createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "invalid.refresh.token");
        }
    
        let newRefreshToken: string | null = null;
    
        // 토큰 만료 체크 및 rotation
        if (storedToken.revokes_at < new Date()) {
            console.log("토큰 만료 체크 및 rotation");
            
            newRefreshToken = JWTUtil.generateRefreshToken({
                userId: userId,
                username: username
            });
    
            await tokenRepository.replaceRefreshToken(refreshToken, newRefreshToken);
        }
    
        // 새로운 액세스 토큰 발급
        const newAccessToken = JWTUtil.generateAccessToken({
            userId: userId,
            username: username
        });
    
        return createGoogleStyleResponse(req, res, StatusCodes.OK, {
            accessToken: newAccessToken,
            ...(newRefreshToken && { newRefreshToken })
        }, null);
    }
}