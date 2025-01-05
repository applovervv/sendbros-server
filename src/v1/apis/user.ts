import { Router, Request, Response, NextFunction, json } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { userRepository } from '../db/repositories/user.repo';
import { errorHandler } from '../utils/error-handler';
import { UserController } from '../controllers/user-controller';
import { validateAccessToken } from '../middlewares/access.token.validate.middleware';

const router = Router();

const userController = new UserController();


/*

PATCH api/v1/users/me/receive-settings

{
  "receiveFrom": "friends_only" | "anyone"
}

headers

{
  "Authorization": "Bearer <accessToken>"
}

*/
router.patch('/me/receive-settings', validateAccessToken, errorHandler(async (req: Request, res: Response) => {
 return  await userController.updateFileReceiveSettings(req, res);
}))

router.get(
  '/',
  errorHandler(async (req: Request, res: Response) => {
    if (req.query.offset === undefined || req.query.limit === undefined) {
      return createGoogleStyleResponse(
        req,
        res,
        400,
        {},
        "The query is missing required parameters: 'offset' or 'limit'"
      );
    }

    if (isNaN(Number(req.query.offset)) || isNaN(Number(req.query.limit))) {
      return createGoogleStyleResponse(
        req,
        res,
        400,
        {},
        "Invalid input: 'offset' and 'limit' must be valid numbers."
      );
    }

    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    const user_count = await userRepository.countUsers();
    const users = await userRepository.getAllUsers(offset, limit);

    return createGoogleStyleResponse(
      req,
      res,
      200,
      {
        total: user_count,
        offset: offset,
        limit: limit,
        items: users,
      },
      null
    );
  })
);

/*

POST api/v1/users/

{
  "username:" "string",
  "email": "string",
  "password": "string"
}
  
*/

router.post("/", errorHandler(async (req: Request, res: Response) => {
  await userController.createUser(req, res);
}))

/*

GET api/v1/users/me

headers 

{
  "Authorization": "Bearer <accessToken>"
}

*/

router.get("/me", validateAccessToken, errorHandler(async (req: Request, res: Response) => {
  return await userController.getUserByAccessToken(req, res);
}))

export { router };