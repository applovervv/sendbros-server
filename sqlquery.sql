-- 사용자 테이블
-- 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 이메일 인증 테이블
-- CREATE TABLE email_verifications (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--     verification_token VARCHAR(255) NOT NULL,
--     is_used BOOLEAN DEFAULT FALSE,
--     expires_at TIMESTAMP WITH TIME ZONE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- 활성 상태 테이블
CREATE TABLE user_status (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT TRUE,
    manual_offline BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE friend_status_enum AS ENUM ('pending', 'accepted', 'rejected');

-- 친구 관계 테이블
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status friend_status_enum DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);


CREATE INDEX idx_friendship_status ON friendships(status);
CREATE INDEX idx_friendship_users ON friendships(user_id, friend_id);

-- 차단 테이블
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

CREATE TYPE transfer_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'failed');

-- 파일 전송 테이블
CREATE TABLE file_transfers (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50),
    file_url TEXT NOT NULL,
    status transfer_status_enum DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);


CREATE TYPE receive_from_enum AS ENUM ('friends_only', 'anyone');


-- 파일 수신 설정 테이블
CREATE TABLE file_receive_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    receive_from receive_from_enum DEFAULT 'friends_only',
    auto_accept BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- refresh token 테이블 추가
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    revokes_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address TEXT
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);