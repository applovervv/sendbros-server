import SQL from "@nearform/sql";
import { BaseRepository } from "./base.repo";
import { FileTransfer } from "../models/file.model";
import { pool } from "../../../lib/dbconn";

export class FileRepository extends BaseRepository {   

    async getFileTransfers(userId: number, offset: number = 0, limit: number = 10): Promise<FileTransfer[]> {
        return this.withTransaction(async (client) => {
            const result = await client.query<FileTransfer>(SQL`SELECT * FROM file_transfers WHERE receiver_id = ${userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
            return result.rows;
        });
    }

    async createFileReceiveSettings(userId: number, receiveFrom: string) : Promise<FileReceiveSettings> {
        return this.withTransaction(async (client) => {
            const result = await client.query<FileReceiveSettings>(SQL`INSERT INTO file_receive_settings (user_id, receive_from) VALUES (${userId}, ${receiveFrom})`);
            return result.rows[0];
        });
    }

    async getFileReceiveSettings(userId: number) : Promise<FileReceiveSettings> {
        return this.withTransaction(async (client) => {
            const result = await client.query<FileReceiveSettings>(SQL`SELECT * FROM file_receive_settings WHERE user_id = ${userId}`);
            return result.rows[0];
        });
    }

    async createFileTransfer(
        senderId: number, 
        receiverId: number, 
        fileName: string,
        fileSize: number,
        fileType: string,
        fileUrl: string,
    ) {
        return this.withTransaction(async (client) => {  
            const result = await client.query<FileTransfer>(
                SQL`
                    INSERT INTO file_transfers (
                        sender_id, 
                        receiver_id, 
                        file_name,
                        file_size,
                        file_type,
                        file_url,
                        status
                    ) 
                    VALUES (
                        ${senderId}, 
                        ${receiverId}, 
                        ${fileName}, 
                        ${fileSize}, 
                        ${fileType}, 
                        ${fileUrl},
                        'pending'
                    )
                    RETURNING *
                `
            );
            return result.rows[0];
        });
    }

    async rejectFileTransfer(id: number) {
        return this.withTransaction(async (client) => {
            const result = await client.query<FileTransfer>(SQL`UPDATE file_transfers SET status = 'rejected' WHERE id = ${id}`);
            return result.rows[0];
        });
    }

    async acceptFileTransfer(id: number) {
        return this.withTransaction(async (client) => {
            const result = await client.query<FileTransfer>(SQL`UPDATE file_transfers SET status = 'accepted' WHERE id = ${id}`);
            return result.rows[0];
        });
    }

    async updateFileReceiveSettings(userId: number, receiveFrom: string) {
        return this.withTransaction(async (client) => {
            const result = await client.query<FileReceiveSettings>(SQL`UPDATE file_receive_settings SET receive_from = ${receiveFrom} WHERE user_id = ${userId}`);
            return result.rows[0];
        });
    }
}

export const fileRepository = new FileRepository();