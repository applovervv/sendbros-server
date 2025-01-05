import { Request, Response } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { userRepository } from '../db/repositories/user.repo';
import { JWTUtil } from '../../lib/jwt-utils';
import { StatusCodes } from 'http-status-codes';
import { fileRepository } from '../db/repositories/file.repo';

export class UserController {

    async updateFileReceiveSettings(req: Request, res: Response) : Promise<Response> {
        const { receiveFrom } = req.body;
        const { userId } = req.accessTokenPayload!;

        await fileRepository.updateFileReceiveSettings(userId, receiveFrom);
        
        return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, null);
    }

    async createUser(req: Request, res: Response) {
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

        //TODO: 유저 생성 로직 추가
        const user = await userRepository.createUser({
            username: username,
            email: email,
            password_hash: password,
        });


        const token = JWTUtil.generateAccessToken(
            {
            userId: user!.id!,username:user.username,
            }
        );
        //TODO: 유저 생성 후 토큰 발급

        console.log(token); 

        return createGoogleStyleResponse(req, res, StatusCodes.OK, {
            username,
            email,
            token: token // If you're using JWT
         }, null);
    }

    // test
    async getUserByAccessToken(req: Request, res: Response): Promise<Response> {
          const { userId } = req.accessTokenPayload!;
        
          const user = await userRepository.getUserById(userId);

          if(!user) {
              return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "User not found");
          }

          console.log(user);
          const fileReceiveSettings = await fileRepository.getFileReceiveSettings(user.id!);
          
          
          return createGoogleStyleResponse(
            req,
            res,
            StatusCodes.OK,
            {
             receive_from: fileReceiveSettings.receive_from,
              username: user.username,
              email: user.email,
            },
            null
          );
    }
}