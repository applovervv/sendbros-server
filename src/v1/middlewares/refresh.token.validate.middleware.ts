import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../../lib/jwt-utils';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { StatusCodes } from 'http-status-codes';
import { JwtService } from '../../lib/jwt-service';

export const validateRefreshToken = function (req:Request, res:Response, next:NextFunction) {
    const refreshToken = JwtService.extractRefreshTokenFromRequest(req)

    if(refreshToken === undefined) {
        createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "invalid.refresh.token");
        return;
    }

    req.refreshToken = refreshToken
    
    let isError = false;

    JWTUtil.verifyRefreshToken(req.refreshToken!, (err, decoded) => {
        if(err) {
            isError = true;
        }

        if(!decoded) {
            isError = true;
        }

        req.refreshTokenPayload = decoded!;
       }
    );
    
    if(isError) {
        createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "invalid.refresh.token");
        return;
    }

    next()
};

