import SQL from "@nearform/sql";
import { pool } from "../../../lib/dbconn";
import { BaseRepository } from "./base.repo";
import { Friend } from "../models/friend.model";

export class FriendRepository extends BaseRepository {

    async getFriends(userId: number, offset: number = 0, limit: number = 10): Promise<Friend[]> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT 
                f.*,
                u.username
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            WHERE f.user_id = ${userId}
            AND f.status = 'accepted'
            ORDER BY u.username
            LIMIT ${limit} OFFSET ${offset}
            `
        );
        return result.rows;
    }

    async getAllFriends(userId: number): Promise<Friend[]> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT 
                f.*,
                u.username
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            WHERE f.user_id = ${userId}
            AND f.status = 'accepted'
            ORDER BY u.username
            `
        );
        return result.rows;
    }

    async getAllFriendsByUsername(username: string): Promise<Friend[]> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT 
                f.*,
                u.username
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            JOIN users u2 ON f.user_id = u2.id
            WHERE u2.username = ${username}
            AND f.status = 'accepted'
            ORDER BY u.username
            `
        );
        return result.rows;
    }
    

    
    
    async isFriend(userId: number, friendId: number): Promise<boolean> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT * FROM friendships 
            WHERE ((user_id = ${userId} AND friend_id = ${friendId})
            OR (user_id = ${friendId} AND friend_id = ${userId}))
            AND status = 'accepted'
            `
        );
        return result.rows.length > 0;
    }
    

    async getFriendRequests(userId: number): Promise<Friend[]> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT 
                f.*,
                u.username
            FROM friendships f
            JOIN users u ON f.user_id = u.id
            WHERE f.friend_id = ${userId} 
            AND f.status = 'pending'
            ORDER BY f.created_at DESC
            `
        );
        return result.rows;
    }

    async sendFriendRequest(userId: number, friendId: number): Promise<Friend> {
        return this.withTransaction(async (client) => {   
            const existing = await client.query<Friend>(
                SQL`
                SELECT * FROM friendships
                WHERE ((user_id = ${userId} AND friend_id = ${friendId})
                OR (user_id = ${friendId} AND friend_id = ${userId}))
                `
            );
            
            if (existing.rows.length > 0) {
                throw new Error('Friendship request already exists or users are already friends');
            }

            const result = await client.query<Friend>(
                SQL`
                INSERT INTO friendships (user_id, friend_id, status)
                VALUES (${userId}, ${friendId}, 'pending')
                RETURNING *
                `
            );
            return result.rows[0];
        })
    }

    async getSentFriendRequests(userId: number): Promise<Friend[]> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT 
                f.*,
                u.username
            FROM friendships f
            JOIN users u ON f.friend_id = u.id
            WHERE f.user_id = ${userId} 
            AND f.status = 'pending'
            ORDER BY f.created_at DESC
            `
        );
        return result.rows;
    }

    async acceptFriendRequest(userId: number, friendId: number): Promise<Friend> {
        return this.withTransaction(async (client) => {
            const result = await client.query<Friend>(
                SQL`
                UPDATE friendships f
                SET status = 'accepted',
                    updated_at = CURRENT_TIMESTAMP
                FROM users u
                WHERE f.friend_id = ${userId} 
                AND f.user_id = ${friendId}
                AND f.user_id = u.id
                AND f.status = 'pending'
                RETURNING f.*, u.username
                `
            );

            if (result.rows.length === 0) {
                throw new Error('Friend request not found');
            }

            await client.query(
                SQL`
                INSERT INTO friendships (user_id, friend_id, status)
                VALUES (${userId}, ${friendId}, 'accepted')
                ON CONFLICT (user_id, friend_id) DO UPDATE
                SET status = 'accepted',
                    updated_at = CURRENT_TIMESTAMP
                `
            );

            return result.rows[0];
        });
    }

    async rejectFriendRequest(userId: number, friendId: number): Promise<Friend> {
        return this.withTransaction(async (client) => {   
            const result = await client.query<Friend>(
                SQL`
                DELETE FROM friendships
                WHERE friend_id = ${userId} 
                AND user_id = ${friendId}
                AND status = 'pending'
                RETURNING *
                `
            );
            return result.rows[0];
        })
    }

    async checkFriendship(userId: number, friendId: number): Promise<Friend | null> {
        const result = await pool.query<Friend>(
            SQL`
            SELECT 
                f.*,
                CASE 
                    WHEN f.user_id = ${userId} THEN u2.username
                    ELSE u1.username
                END as username
            FROM friendships f
            JOIN users u1 ON f.user_id = u1.id
            JOIN users u2 ON f.friend_id = u2.id
            WHERE (f.user_id = ${userId} AND f.friend_id = ${friendId})
            OR (f.user_id = ${friendId} AND f.friend_id = ${userId})
            `
        );
        return result.rows[0] || null;
    }

    async deleteFriend(userId: number, friendId: number): Promise<void> {
        return this.withTransaction(async (client) => {   
            await client.query(
                SQL`
                DELETE FROM friendships
                WHERE ((user_id = ${userId} AND friend_id = ${friendId})
                OR (user_id = ${friendId} AND friend_id = ${userId}))
                AND status = 'accepted'
                `
            );
        })
    }

    async cancelFriendRequest(userId: number, friendId: number): Promise<void> {
        return this.withTransaction(async (client) => {   
            await client.query(
                SQL`
                DELETE FROM friendships
                WHERE user_id = ${userId} 
                AND friend_id = ${friendId}
                AND status = 'pending'
            `
        );
     })
    }

}

export const friendRepository = new FriendRepository();
