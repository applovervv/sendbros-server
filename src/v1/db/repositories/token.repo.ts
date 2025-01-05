import { Pool, PoolClient } from 'pg';
import { pool } from '../../../lib/dbconn';
import SQL from '@nearform/sql';
import { BaseRepository } from './base.repo';
import { RefreshToken } from '../models';

// User repository with transaction support
export class TokenRepository extends BaseRepository {
    private readonly tableName = 'refresh_tokens';

    async getRefreshTokens(offset: number = 10, limit: number = 10): Promise<RefreshToken[]> {
        const result = await pool.query<RefreshToken>(
            SQL`SELECT * FROM ${this.tableName} LIMIT ${limit} OFFSET ${offset}`
        );
        return result.rows;
    }

    async findRefreshToken(token: string) : Promise<RefreshToken | null> {
        const result = await pool.query<RefreshToken>(
            `SELECT * FROM ${this.tableName} WHERE token = $1`,
            [token]
        );
        return result.rows[0];
    }  

    async findRefreshTokenByUserId(userId: number): Promise<RefreshToken> {
        const result = await pool.query<RefreshToken>(
            SQL`SELECT * FROM ${this.tableName} WHERE user_id = ${userId}`,
        );
        return result.rows[0];
    }
    
    async deleteRefreshToken(token: string) : Promise<RefreshToken> {
        return this.withTransaction(async (client) => {   
            const result =  await client.query(
                SQL`DELETE FROM ${this.tableName} WHERE token = ${token}`,
            );
            return result.rows[0];
        })
    }

    async createRefreshToken(tokenData: RefreshToken): Promise<RefreshToken> {
        return this.withTransaction(async (client) => {     
            const result = await client.query<RefreshToken>(
                `INSERT INTO ${this.tableName} (user_id, token, revokes_at, user_agent, ip_address)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [tokenData.user_id, tokenData.token, tokenData.revokes_at, tokenData.user_agent, tokenData.ip_address]
            );
            return result.rows[0];
        });
    }
    
    async replaceRefreshToken(token: string, newToken: string) : Promise<RefreshToken> {
        return this.withTransaction(async (client) => {   
            const result = await client.query(
                `UPDATE ${this.tableName} SET token = $1 WHERE token = $2`,
                [newToken, token]
            );
            return result.rows[0];
        })
    }
}

// Export a singleton instance
export const tokenRepository = new TokenRepository();

// You can now use it like this:
// import { userRepository } from './user.repository';
// const user = await userRepository.createUser({ ... });