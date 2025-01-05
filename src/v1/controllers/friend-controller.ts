import { Request, Response } from "express";
import { friendRepository } from "../db/repositories/friend.repo";
import { StatusCodes } from "http-status-codes";
import { createGoogleStyleResponse } from "../../lib/formatter";
import { userRepository } from "../db/repositories";
import { SocketManager } from "../../lib/socket-manager";
import { FriendWithOnlineStatus } from "../db/models/friend.model";
import { GetFriendRequestsResponse, GetFriendsResponse, GetSendFriendRequestResponse, GetSentFriendRequestsResponse } from "../responses";

export class FriendController {
    // 친구 목록 조회
    async getFriends(req: Request, res: Response): Promise<Response> {
        const { userId } = req.accessTokenPayload!;
        const { offset = 0, limit = 10 } = req.query;

        const friends = await friendRepository.getFriends(
            userId,
            Number(offset),
            Number(limit)
        );

        const friendsWithOnlineStatus: FriendWithOnlineStatus[] = await Promise.all(friends.map(async (friend) => {
            const isOnline = SocketManager.getInstance().getUserId(friend.username);

            const friendAsOnlineStatus = friend as FriendWithOnlineStatus;
            friendAsOnlineStatus.isOnline = isOnline ? true : false;

            return friendAsOnlineStatus;
         
        }));

        return createGoogleStyleResponse<GetFriendsResponse>(req, res, StatusCodes.OK, {
            friends: friendsWithOnlineStatus,
            pagination: {
                offset: Number(offset),
                limit: Number(limit),
            }
        }, null);
    }

    // 받은 친구 요청 목록 조회
    async getFriendRequests(req: Request, res: Response): Promise<Response> {
        const { userId } = req.accessTokenPayload!;
        const requests = await friendRepository.getFriendRequests(userId);

        return createGoogleStyleResponse<GetFriendRequestsResponse>(req, res, StatusCodes.OK, {
            requests: requests
        }, null);
    }

    // 보낸 친구 요청 목록 조회
    async getSentFriendRequests(req: Request, res: Response): Promise<Response> {
        const { userId } = req.accessTokenPayload!;
        const sentRequests = await friendRepository.getSentFriendRequests(userId);

        return createGoogleStyleResponse<GetSentFriendRequestsResponse>(req, res, StatusCodes.OK, {
            sentRequests: sentRequests
        }, null);
    }

    // 친구 신청
    async sendFriendRequest(req: Request, res: Response): Promise<Response> {
        const { userId ,username} = req.accessTokenPayload!;
        const { friendName } = req.body;

        if (!friendName) {
            return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "친구 ID가 필요합니다.");
        }


        const friend = await userRepository.getUserByUsername(friendName);

        if (!friend || !friend.id) {
            return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "친구가 존재하지 않습니다.");
        }

        if(friend.username === username) {
            return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "자기 자신에게 친구 신청할 수 없습니다.");
        }
        
        const friendId = friend.id!;
    
        // 이미 친구 관계가 있는지 확인
        const existingFriendship = await friendRepository.checkFriendship(userId, friendId);
        if (existingFriendship) {
            return createGoogleStyleResponse(req, res, StatusCodes.BAD_REQUEST, {}, "이미 친구이거나 대기 중인 요청이 있습니다.");
        }

        const friendship = await friendRepository.sendFriendRequest(userId, friendId);

        const socketIds = SocketManager.getInstance().getSocketIds(friend.username);

        if(socketIds && socketIds.length > 0) {
            friendship.username = username;

            console.log("wow..hell friendship : ", friendship);

           for(const socketId of socketIds) {
            SocketManager.getInstance().getIo().to(socketId).emit('friend_request_received', {
                friendship
            });
           }
        }

        return createGoogleStyleResponse<GetSendFriendRequestResponse>(req, res, StatusCodes.OK, {
            friendship: friendship
        }, null);
    }

    // 친구 요청 수락
    async acceptFriendRequest(req: Request, res: Response): Promise<Response> {
        const { userId, username } = req.accessTokenPayload!;
        const { friendId } = req.params;

        const friendship = await friendRepository.acceptFriendRequest(userId, Number(friendId)) as FriendWithOnlineStatus;
        if (!friendship) {
            return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "친구 요청을 찾을 수 없습니다.");
        }

        const socketIds = SocketManager.getInstance().getSocketIds(friendship.username);

        console.log("acceptFriendRequest : ", friendship);
        
        if(socketIds && socketIds.length > 0) {
            const isOnline = SocketManager.getInstance().getUserId(username);

            friendship.username = username;
            friendship.isOnline = isOnline ? true : false;

            console.log("wow.. friendship : ", friendship);
           for(const socketId of socketIds) {
            SocketManager.getInstance().getIo().to(socketId).emit('friend_request_accepted', {
                friendship
            });
           }
        }

        return createGoogleStyleResponse(req, res, StatusCodes.OK, {
            friendship
        }, null);
    }

    // 친구 요청 거절
    async rejectFriendRequest(req: Request, res: Response): Promise<Response> {
        const { userId } = req.accessTokenPayload!;
        const { friendId } = req.params;

        const friendship = await friendRepository.rejectFriendRequest(userId, Number(friendId));
        
        console.log("hell : ", friendship);
        if (!friendship) {
            return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "친구 요청을 찾을 수 없습니다.");
        }

        return createGoogleStyleResponse(req, res, StatusCodes.OK, {
            friendship
        }, null);
    }

    // 친구 삭제
    async deleteFriend(req: Request, res: Response): Promise<Response> {
        const { userId } = req.accessTokenPayload!;
        const { friendId } = req.params;

        await friendRepository.deleteFriend(userId, Number(friendId));

        const friendUser = await userRepository.getUserById(Number(friendId));

        if(!friendUser) {
            return createGoogleStyleResponse(req, res, StatusCodes.NOT_FOUND, {}, "Friend deleted or not found.");
        }

        const socketIds = SocketManager.getInstance().getSocketIds(friendUser!.username!);

        if(socketIds && socketIds.length > 0) {
            for(const socketId of socketIds) {
                SocketManager.getInstance().getIo().to(socketId).emit('friend_deleted', {
                    deletedFriendId: userId
                });
            }
        }
        
        return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, null);
    }

    // 보낸 친구 요청 취소
    async cancelFriendRequest(req: Request, res: Response): Promise<Response> {
        const { userId } = req.accessTokenPayload!;
        const { friendId } = req.params;

        await friendRepository.cancelFriendRequest(userId, Number(friendId));

        return createGoogleStyleResponse(req, res, StatusCodes.OK, {}, null);
    }
}

export const friendController = new FriendController();



