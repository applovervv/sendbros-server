import { Request, Response } from 'express';
import { LoginRequest } from '../requests';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { userRepository } from '../db/repositories/user.repo';
import { JWTUtil } from '../../lib/jwt-utils';
import { mailSender, sendEmailVerificationMail, sendPasswordResetMail } from '../../lib/mail-sender';
import { comparePassword, hashedPassword } from '../../lib/password';
import { StatusCodes } from 'http-status-codes';
import { tokenRepository } from '../db/repositories';
import { RefreshTokenPayload } from '../../lib/jwt-utils/types';
import { RefreshToken } from '../db/models';
import { fileRepository } from '../db/repositories/file.repo';

export class AuthController {
    // 로그인
  async login(req: Request<{}, {}, LoginRequest>, res: Response) :Promise<Response> {
    const { email, password } = req.body; // good

    if(!email) {
        return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "Email or username is required");
    } // ok

    if(!password) {
        return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "Password is required");
    } // ok

    //위 로직까지는 올바르게 작동함. (TEST 완료)

    const user = await userRepository.getUserByEmailOrUsername(email!, email!);
    
    if(!user) {
        return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "User not found");
    }

    //비밀번호 검증
    const isPasswordCorrect = await comparePassword(password, user.password_hash!);

    if(!isPasswordCorrect) {
        return createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "Invalid password");
    }

    const isEmailVerified = user.is_email_verified;

    if(!isEmailVerified) {
        return createGoogleStyleResponse(req, res, StatusCodes.FORBIDDEN, {}, "Email not verified");
    }

    // 로그인 성공, 토큰 발급

    const accessToken = JWTUtil.generateAccessToken(
        {
        userId: user!.id!,username:user.username,
        }
    );

    const refreshToken = JWTUtil.generateRefreshToken(
        {
        userId: user!.id!,username:user.username,
        }
    );

    // 리프레시 토큰을 DB에 저장
    await tokenRepository.createRefreshToken({
         user_id: user!.id!,
         token: refreshToken,
         revokes_at: new Date(Date.now() + 3 * 60 * 60 * 1000), //3시간 
         user_agent: req.headers['user-agent'],
         ip_address: req.ip,
     });

    return createGoogleStyleResponse(req, res, StatusCodes.OK, {
        email,
        accessToken, // If you're using JWT
        refreshToken
     }, null);
  }

  async signup(req: Request, res: Response) :Promise<Response> {
    const { username, email, password } = req.body;

    if(!username && !email) {
        return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "Username or email is required");
    }

    if(!password) {
        return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "Password is required");
    }

    console.log(username, email, password);

    const userExists = await userRepository.getUserByEmailOrUsername(email!, username!);

    if(userExists) {
        return createGoogleStyleResponse(req, res, StatusCodes.CONFLICT, {}, "User already exists");
    }
    //계정 생성 시작 
    
    // 비밀번호 해싱
    const dbPassword :string = await hashedPassword(password);

    console.log(dbPassword);

    // 유저 생성 로직 
    const user = await userRepository.createUser({
        username: username,
        email: email,
        password_hash: dbPassword,
    });

    // 파일 수신 설정 생성
    await fileRepository.createFileReceiveSettings(user!.id!, 'friends_only');
    
    // 이메일 인증 토큰 발급
    const emailVerificationToken = JWTUtil.generateEmailVerificationToken({ userId: user!.id! });

    // 이메일 인증 메일 발송
    await sendEmailVerificationMail(email, emailVerificationToken, (error) => {
        if(error) {
            return createGoogleStyleResponse(req, res, StatusCodes.INTERNAL_SERVER_ERROR, {}, "Failed to send email verification mail");
        }
    });

    // 계정 생성 및 인증 메일 발송 완료
    return createGoogleStyleResponse(req, res, StatusCodes.OK, {
        username,
        email,
     }, null);
  }

  async resendEmailVerificationMail(req: Request, res: Response) : Promise<Response> {
    const { email } = req.body;

    const user = await userRepository.getUserByEmail(email!);

    if(!user) {
        return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "User not found");
    }

    if(user.is_email_verified) {
        return createGoogleStyleResponse(req, res, StatusCodes.CONFLICT, {}, "Email already verified");
    }

    const emailVerificationToken = JWTUtil.generateEmailVerificationToken({ userId: user!.id! });

    await sendEmailVerificationMail(email, emailVerificationToken, (error) => {
        if(error) {
            return createGoogleStyleResponse(req, res, StatusCodes.INTERNAL_SERVER_ERROR, {}, "Failed to send email verification mail");
        }
    });

    return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, "Email verification mail sent");
  }

  async verifyEmail(req: Request, res: Response) : Promise<Response> {
    const { token } = req.params;

    let userId : number | null | undefined = null;

    JWTUtil.verifyEmailVerificationToken(token, (err, decoded) => {
      if(err) {
          return createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "Invalid Email Verification Token");
      }
       userId = decoded?.userId;
     }
    );

    if(!userId) {
        return createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "Invalid Email Verification Token");
    }

    await userRepository.updateUserEmailVerifiedStatus(userId, true); // email_verified: true  

    //이메일 인증 완료
    return createGoogleStyleResponse(req, res, StatusCodes.OK, {
     message: "Email verified successfully.",
    }, null);
  }

async forgotPassword(req: Request, res: Response) : Promise<Response> {
    const { email } = req.body;

    const user = await userRepository.getUserByEmail(email!);

    if(!user) {
        return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "User not found");
    }

    const passwordResetToken = JWTUtil.generatePasswordResetToken({ userId: user!.id! });

    await sendPasswordResetMail(email, passwordResetToken, (error) => {
        if(error) {
            return createGoogleStyleResponse(req, res, StatusCodes.INTERNAL_SERVER_ERROR, {}, "Failed to send password reset mail");
        }
    });

    // 비밀번호 재설정 메일 발송 완료
    return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, null);
}

async resendPasswordResetMail(req: Request, res: Response) : Promise<Response> {
    const { email } = req.body;

    const user = await userRepository.getUserByEmail(email!);

    if(!user) {
        return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "User not found");
    }

    const passwordResetToken = JWTUtil.generatePasswordResetToken({ userId: user!.id! });

    await sendPasswordResetMail(email, passwordResetToken, (error) => {
        if(error) {
            return createGoogleStyleResponse(req, res, StatusCodes.INTERNAL_SERVER_ERROR, {}, "Failed to send password reset mail");
        }
    });

    // 비밀번호 재설정 메일 발송 완료
    return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, null);
}

async resetPassword(req: Request, res: Response) : Promise<Response> {
    const { token, password } = req.body;

    if(!token || !password) {
        return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "Token and password are required");
    }

    let userId : number | null | undefined = null;

    JWTUtil.verifyPasswordResetToken(token, (err, decoded) => {
        if(err) {
            return createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "Invalid password reset token");
        }
        userId = decoded?.userId;
    });

    if(!userId) {
        return createGoogleStyleResponse(req, res, StatusCodes.UNAUTHORIZED, {}, "Invalid password reset token");
    }

    await userRepository.updateUserPassword(userId, password);

    return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, "Password reset successful");
}

}