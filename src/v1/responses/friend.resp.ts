import { Friend, FriendRequest, FriendWithOnlineStatus } from "../db/models/friend.model";

export interface GetFriendsResponse {
    friends: FriendWithOnlineStatus[];
    pagination: {
        offset: number;
        limit: number;
    }
}

export interface GetFriendRequestsResponse {
    requests: FriendRequest[];
}

export interface GetSentFriendRequestsResponse {
    sentRequests: FriendRequest[];
}

export interface GetSendFriendRequestResponse {
    friendship: Friend;
}