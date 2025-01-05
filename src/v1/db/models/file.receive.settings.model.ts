interface FileReceiveSettings {
    user_id: number;
    receive_from: 'friends_only' | 'anyone';
    auto_accept: boolean;
    require_approval: boolean;
    updated_at: Date;
}