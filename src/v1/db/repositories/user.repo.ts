import { Pool, PoolClient } from 'pg';
import { pool } from '../../../lib/dbconn';
import { User } from '../models/user.model';
import SQL from '@nearform/sql';
import { BaseRepository } from './base.repo';
import { hashedPassword } from '../../../lib/password';


// User repository with transaction support
export class UserRepository extends BaseRepository {
    async countUsers(shard?: Pool): Promise<number> {
        if (shard) {
            const result = await shard.query('SELECT COUNT(*) FROM users');
            return parseInt(result.rows[0].count);
        } else {
            const result = await pool.query('SELECT COUNT(*) FROM users');
            return parseInt(result.rows[0].count);
        }
    }

    async getAllUsers(offset: number = 10, limit: number = 10): Promise<User[]> {
        const result = await pool.query<User>(
            SQL`SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`
        );
        return result.rows;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const result = await pool.query<User>(
            SQL`SELECT * FROM users WHERE email = ${email}`
        );
        return result.rows[0] || null;
    }

    async getUserById(id: number): Promise<User | null> {
        const result = await pool.query<User>(
            SQL`SELECT * FROM users WHERE id = ${id}`
        );
        return result.rows[0] || null;
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const result = await pool.query<User>(
            SQL`SELECT * FROM users WHERE username = ${username}`
        );
        return result.rows[0] || null;
    }

    async getUserByEmailOrUsername(email: string, username: string): Promise<User | null> {
        const result = await pool.query<User>(
            SQL`SELECT * FROM users WHERE email = ${email} OR username = ${username}`
        );
        return result.rows[0] || null;
    }

    async updateUserPassword(userId: number, password: string): Promise<User> {
        const _hashedPassword = await hashedPassword(password);
        const result = await pool.query<User>(
            SQL`UPDATE users SET password_hash = ${_hashedPassword} WHERE id = ${userId} RETURNING *`
        );
        return result.rows[0];
    }

    async createUser(user: User): Promise<User> {
        return this.withTransaction(async (client) => {
            const result = await client.query<User>(
                SQL`INSERT INTO users (
                    username, 
                    email, 
                    password_hash
                ) VALUES (
                    ${user.username}, 
                    ${user.email}, 
                    ${user.password_hash}
                ) RETURNING *`
            );
            return result.rows[0];
        });
    }

    async updateUserById(userId: number, user: User): Promise<User> {
        return this.withTransaction(async (client) => {
            const result = await client.query<User>(SQL`
                UPDATE users 
                SET 
                    username = ${user.username},
                    email = ${user.email},
                    password_hash = ${user.password_hash},
                    profile_image_url = ${user.profile_image_url},
                    refresh_token = ${user.refresh_token},
                    last_login_at = ${user.last_login_at},
                    deleted_at = ${user.deleted_at},
                    is_email_verified = ${user.is_email_verified}
                WHERE id = ${userId}
                RETURNING *
            `);
            return result.rows[0];
        });
    }

    async updateUserEmailVerifiedStatus(userId: number, is_email_verified: boolean): Promise<User> {
        return this.withTransaction(async (client) => {
            const result = await client.query<User>(
                SQL`UPDATE users 
                    SET is_email_verified = ${is_email_verified} 
                    WHERE id = ${userId} 
                    RETURNING *`
            );
            return result.rows[0];
        });
    }

    // Example of a method that needs multiple operations in a single transaction
    async createUserWithProfile(user: User, profileData: any): Promise<User> {
        return this.withTransaction(async (client) => {
            // Create user
            const userResult = await client.query<User>(
                SQL`INSERT INTO users (
                    username, 
                    email, 
                    password_hash
                ) VALUES (
                    ${user.username}, 
                    ${user.email}, 
                    ${user.password_hash}
                ) RETURNING *`
            );
            
            // Create profile using the new user's ID
            await client.query(
                SQL`INSERT INTO user_profiles (
                    user_id, 
                    ...other_fields
                ) VALUES (
                    ${userResult.rows[0].id}, 
                    ...other_values
                )`
            );

            return userResult.rows[0];
        });
    }
}

// Export a singleton instance
export const userRepository = new UserRepository();

// You can now use it like this:
// import { userRepository } from './user.repository';
// const user = await userRepository.createUser({ ... });