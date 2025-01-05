import { Router, Request, Response } from 'express';

import {
    errorHandler,
} from '../utils/error-handler';

import { validateRefreshToken } from '../middlewares/refresh.token.validate.middleware';
import { TokenController } from '../controllers/token-controller';

const router = Router();

const tokenController = new TokenController();

/*

POST api/v1/token/reissue

headers:
{
    "refresh-token": "string"
}

or

headers:
{
    "x-refresh-token": "string"
}
    
returns access token and new refresh token (if rotation is needed).

return type:

{
    "accessToken": "string",
    "newRefreshToken": "string"
}


*/

router.post("/reissue", validateRefreshToken, errorHandler(async (req: Request, res: Response) => {
  return await tokenController.reissue(req, res);
}));


export { router };