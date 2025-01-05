import { Router, Request, Response } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';
import {
    errorHandler,
} from '../utils/error-handler';

import { AuthController } from '../controllers/auth-controller';

const router = Router();

const authController = new AuthController();

/* 

GET api/v1/auth 

*/
router.get(
  '/',
  errorHandler(async (req: Request, res: Response) => {
    return createGoogleStyleResponse(
      req,
      res,
      200,
      {
        example: 'Hello World',
      },
      null
    );
  })
);


/* 

POST api/v1/auth/login

{
    "username": "string",
    "email": "string",
    "password": "string"  
} 
see types/index.ts for more details

*/
router.post(
  '/login',
  errorHandler(async (req: Request, res: Response) => {
    return await authController.login(req, res);
  })
);

/*

POST api/v1/auth/signup

{
    "username": "string",
    "email": "string",
    "password": "string"  
} 

*/
router.post('/signup', errorHandler(async (req:Request, res:Response) => {
    return await authController.signup(req,res);
}))

/*

GET api/v1/auth/email/verify/:token

usage : api/v1/auth/email/verify/your-token (just url)

*/
router.get('/email/verify/:token', errorHandler(async (req:Request, res:Response) => {
    return await authController.verifyEmail(req,res);
}))

/*

POST api/v1/auth/email/resend-verification

{
    "email": "string"
}

*/
router.post("/email/resend-verification", errorHandler(async (req: Request, res: Response) => {
  return await authController.resendEmailVerificationMail(req, res);
}));

/*

POST api/v1/auth/forgot-password

{
    "email": "string"
}

*/
router.post('/forgot-password', errorHandler(async (req: Request, res: Response) => {
  return await authController.forgotPassword(req, res);
}));


/*

POST api/v1/auth/forgot-password/resend

{
    "email": "string"
}

*/
router.post('/forgot-password/resend', errorHandler(async (req: Request, res: Response) => {
  return await authController.resendPasswordResetMail(req, res);
}));

/*

PATCH api/v1/auth/reset-password

{
    "token": "string", // 비밀번호 재설정 요청했을 때 이메일로 오는 토큰
    "password": "string" // 새로운 비밀번호
}

*/

router.patch('/reset-password', errorHandler(async (req: Request, res: Response) => {
  return await authController.resetPassword(req, res);
}));

export { router };