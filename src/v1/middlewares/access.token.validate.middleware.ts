import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../../lib/jwt-utils';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { StatusCodes } from 'http-status-codes';
import { JwtService } from '../../lib/jwt-service';

export const validateAccessToken = function (req:Request, res:Response, next:NextFunction) {
    const accessToken = JwtService.extractTokenFromRequest(req)

    console.log("accessToken FUC: ", accessToken);

    if(accessToken === undefined) {
        console.log("accessToken UNDEFINED: ", accessToken);
         createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "invalid.access.token");
         return;
    }

    req.accessToken = accessToken
    
    let isError = false;

    JWTUtil.verifyAccessToken(req.accessToken!, (err, decoded) => {
        if(err) {
           isError = true;
        }

        if(!decoded) {
            isError = true;
        }

        req.accessTokenPayload = decoded!;
       }
    );

    if(isError) {
         createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "invalid.access.token");
         return;
    }

    next()
};

