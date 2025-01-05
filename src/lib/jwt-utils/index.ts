

import jwt from 'jsonwebtoken';
import { AccessTokenPayload, EmailVerificationTokenPayload, RefreshTokenPayload, PasswordResetTokenPayload } from './types';

export class JWTUtil {
  private static readonly accessTokenSecret = process.env.JWT_SECRET!;
  private static readonly emailVerificationTokenSecret = process.env.JWT_EMAIL_VERIFICATION_SECRET!;
  private static readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
  private static readonly passwordResetTokenSecret = process.env.JWT_PASSWORD_RESET_SECRET!;

  static generateAccessToken(payload: AccessTokenPayload, expiresIn: string = '12h'): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn });
  } 

  static generateEmailVerificationToken(payload: EmailVerificationTokenPayload, expiresIn: string = '10m'): string {
    return jwt.sign(payload, this.emailVerificationTokenSecret, { expiresIn });
  }

  static generateRefreshToken(payload: RefreshTokenPayload, expiresIn: string = '7d'): string {
    return jwt.sign(payload, this.refreshTokenSecret, { expiresIn });
  }

  static generatePasswordResetToken(payload: PasswordResetTokenPayload, expiresIn: string = '10m'): string {
    return jwt.sign(payload, this.passwordResetTokenSecret, { expiresIn });
  }

  static verifyAccessToken(
    token: string, 
    callback: (error: Error | null, decoded: AccessTokenPayload | null) => void
  ): void {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as AccessTokenPayload;
      callback(null, decoded);
    } catch (error) {
      console.log("FASDDSAFerror : ", error)
      callback(error as Error, null);
    }
  }

  static verifyRefreshToken(token: string, callback: (error: Error | null, decoded: RefreshTokenPayload | null) => void): void {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
      callback(null, decoded);
    } catch (error) {
      callback(error as Error, null);
    }
  }

  static verifyEmailVerificationToken(token: string, callback: (error: Error | null, decoded: EmailVerificationTokenPayload | null) => void): void {
    try {
      const decoded = jwt.verify(token, this.emailVerificationTokenSecret) as EmailVerificationTokenPayload;
      callback(null, decoded);
    } catch (error) {
      callback(error as Error, null);
    }
  }

  static verifyPasswordResetToken(token: string, callback: (error: Error | null, decoded: PasswordResetTokenPayload | null) => void): void {
    try {
      const decoded = jwt.verify(token, this.passwordResetTokenSecret) as PasswordResetTokenPayload;
      callback(null, decoded);
    } catch (error) {
      callback(error as Error, null);
    }
  }

}
