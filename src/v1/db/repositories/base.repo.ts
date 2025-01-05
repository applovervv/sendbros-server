import { PoolClient } from "pg";
import { pool } from "../../../lib/dbconn";

// Base repository class to handle transactions
export class BaseRepository {
    protected async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}