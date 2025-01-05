export type FriendStatus = 'pending' | 'accepted' | 'rejected';

export interface Friend {
    id: number;
    user_id: number;
    friend_id: number;
    status: FriendStatus;
    created_at: Date;
    updated_at: Date;
    username: string;
}

export interface FriendRequest extends Friend {}

export interface FriendWithOnlineStatus extends Friend {
    isOnline: boolean;
}