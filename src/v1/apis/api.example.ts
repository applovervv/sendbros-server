import { Router, Request, Response } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';

import {
    errorHandler,
} from '../utils/error-handler';

const router = Router();

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

export { router };