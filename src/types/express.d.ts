import type { AccessTokenPayload, RefreshTokenPayload } from "../lib/jwt-utils/types";

declare global {
    namespace Express {
        interface Request {
            accessToken: string | undefined;
            refreshToken: string | undefined;
            accessTokenPayload: AccessTokenPayload | undefined;
            refreshTokenPayload: RefreshTokenPayload | undefined;
        }
    }
}

export {};