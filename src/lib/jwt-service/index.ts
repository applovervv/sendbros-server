

import { Request } from 'express';

export class JwtService {
    static extractTokenFromRequest = (req: Request): string | undefined => {
        const TOKEN_PREFIX = 'Bearer '
        const auth = req.headers.authorization
        const token = auth?.includes(TOKEN_PREFIX)
          ? auth.split(TOKEN_PREFIX)[1]
          : auth
        // console.log("accessToken : ", token)
        // console.log("accessToken : ", typeof token)

        if(token?.includes("undefined")) {
            return undefined;
        }

        return token
      }

    static extractRefreshTokenFromRequest = (req: Request): string | undefined => {
        const TOKEN_PREFIX = 'Bearer '
        const refreshAuth = req.headers['refresh-token'] || req.headers['x-refresh-token'];

        const token = typeof refreshAuth === 'string' && refreshAuth.includes(TOKEN_PREFIX)
            ? refreshAuth.split(TOKEN_PREFIX)[1]
            : refreshAuth;

        if(token?.includes("undefined")) {
            return undefined;
        }

        console.log("refreshToken : ", token);
        return typeof token === 'string' ? token : undefined;
    }
}