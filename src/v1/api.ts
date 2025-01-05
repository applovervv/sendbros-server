import { Router, Request, Response, NextFunction, json } from 'express';
import bodyParser from 'body-parser';
import { router as userRouter } from './apis/user';
import { router as authRouter } from './apis/auth';
import { router as fileRouter } from './apis/file';
import { router as tokenRouter } from './apis/token';
import { router as friendRouter } from './apis/friend';
import { createGoogleStyleResponse } from '../lib/formatter';

const router = Router();

router.use(json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.use('/users', userRouter); // TODO: sign up using phone
router.use('/friends', friendRouter); // TODO: sign up using phone
router.use('/auth', authRouter); // TODO: sign up using phone
router.use('/files', fileRouter); // TODO: sign up using phone
router.use('/token', tokenRouter); // TODO: sign up using phone

// 전역 에러 핸들러
router.use(async (err: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.error(err.stack);
  createGoogleStyleResponse(req, res, 500, {}, 'Something went wrong..');
  next(err);
});

export { router };