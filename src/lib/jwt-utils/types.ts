export  interface AccessTokenPayload {
    userId: number;
    username: string;
  }
  
export interface EmailVerificationTokenPayload {
    userId: number;
}

export interface RefreshTokenPayload {
    userId: number;
    username: string;
}

export interface PasswordResetTokenPayload {
    userId: number;
}