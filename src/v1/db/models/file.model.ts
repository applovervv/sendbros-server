
export interface FileTransfer {
    id: number;
    sender_id: number;
    receiver_id: number;
    file_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'failed';
    created_at: Date;
    completed_at: Date;
}