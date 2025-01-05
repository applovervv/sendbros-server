import { Router, Request, Response } from 'express';
import { createGoogleStyleResponse } from '../../lib/formatter';
import { errorHandler } from '../utils/error-handler';
import { FriendController } from '../controllers/friend-controller';
import { validateAccessToken } from '../middlewares/access.token.validate.middleware';

const router = Router();
const friendController = new FriendController();

/*
[친구 목록 조회]
GET api/v1/friends

Query Parameters (쿼리 파라미터):
{
  offset?: number; // 시작 위치
  limit?: number;  // 가져올 항목 수
}

Return Type (응답 타입):
{
  friends: Array<{
    id: number;          // 친구 관계 ID
    user_id: number;     // 사용자 ID
    friend_id: number;   // 친구 ID
    status: string;      // 상태 (accepted)
    created_at: string;  // 생성일
    updated_at: string;  // 수정일
    username: string;    // 친구 사용자명
  }>;
  pagination: {
    offset: number;
    limit: number;
  }
}
*/
router.get(
  '/',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.getFriends(req, res);
  })
);

/*
[받은 친구 요청 목록 조회]
GET api/v1/friends/requests

Return Type (응답 타입):
{
  requests: Array<{
    id: number;          // 친구 요청 ID
    user_id: number;     // 요청한 사용자 ID
    friend_id: number;   // 요청받은 사용자 ID
    status: string;      // 상태 (pending)
    created_at: string;  // 생성일
    updated_at: string;  // 수정일
    username: string;    // 요청한 사용자명
  }>
}
*/
router.get(
  '/requests',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.getFriendRequests(req, res);
  })
);

/*
[보낸 친구 요청 목록 조회]
GET api/v1/friends/requests/sent

Return Type (응답 타입):
{
  sentRequests: Array<{
    id: number;          // 친구 요청 ID
    user_id: number;     // 요청한 사용자 ID
    friend_id: number;   // 요청받은 사용자 ID
    status: string;      // 상태 (pending)
    created_at: string;  // 생성일
    updated_at: string;  // 수정일
    username: string;    // 요청받은 사용자명
  }>
}
*/
router.get(
  '/requests/sent',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.getSentFriendRequests(req, res);
  })
);

/*
[친구 신청]
POST api/v1/friends/request

Request Body (요청 본문):
{
  friendName: string;  // 친구 신청할 사용자 이름 (username)
}

Return Type (응답 타입):
{
  friendship: {
    id: number;          // 친구 요청 ID
    user_id: number;     // 요청한 사용자 ID
    friend_id: number;   // 요청받은 사용자 ID
    status: string;      // 상태 (pending)
    created_at: string;  // 생성일
    updated_at: string;  // 수정일
  }
}

Error Response (에러 응답):
- 400: "친구 ID가 필요합니다."
- 400: "자기 자신에게 친구 신청할 수 없습니다."
- 400: "이미 친구이거나 대기 중인 요청이 있습니다."
*/
router.post(
  '/request',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.sendFriendRequest(req, res);
  })
);

/*
[친구 요청 수락]
POST api/v1/friends/accept/:friendId

URL Parameters (URL 파라미터):
- friendId: number  // 수락할 친구 요청의 사용자 ID

Return Type (응답 타입):
{
  friendship: {
    id: number;          // 친구 관계 ID
    user_id: number;     // 요청한 사용자 ID
    friend_id: number;   // 요청받은 사용자 ID
    status: string;      // 상태 (accepted)
    created_at: string;  // 생성일
    updated_at: string;  // 수정일
  }
}

Error Response (에러 응답):
- 404: "친구 요청을 찾을 수 없습니다."
*/
router.post(
  '/accept/:friendId',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.acceptFriendRequest(req, res);
  })
);

/*
[친구 요청 거절]
POST api/v1/friends/reject/:friendId

URL Parameters (URL 파라미터):
- friendId: number  // 거절할 친구 요청의 사용자 ID

Return Type (응답 타입):
{
  friendship: {
    id: number;          // 친구 관계 ID
    user_id: number;     // 요청한 사용자 ID
    friend_id: number;   // 요청받은 사용자 ID
    status: string;      // 상태 (rejected)
    created_at: string;  // 생성일
    updated_at: string;  // 수정일
  }
}

Error Response (에러 응답):
- 404: "친구 요청을 찾을 수 없습니다."
*/
router.post(
  '/reject/:friendId',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.rejectFriendRequest(req, res);
  })
);

/*
[친구 삭제]
DELETE api/v1/friends/:friendId

URL Parameters (URL 파라미터):
- friendId: number  // 삭제할 친구의 사용자 ID

Return Type (응답 타입):
{} (빈 객체)
*/
router.delete(
  '/:friendId',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.deleteFriend(req, res);
  })
);

/*
[보낸 친구 요청 취소]
DELETE api/v1/friends/request/:friendId

URL Parameters (URL 파라미터):
- friendId: number  // 취소할 친구 요청의 사용자 ID

Return Type (응답 타입):
{} (빈 객체)
*/
router.delete(
  '/request/:friendId',
  validateAccessToken,
  errorHandler(async (req: Request, res: Response) => {
    return await friendController.cancelFriendRequest(req, res);
  })
);

export { router };
