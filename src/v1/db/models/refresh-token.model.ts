
export interface RefreshToken {
    id?: number;
    user_id: number;
    token: string;
    revokes_at: Date;
    created_at?: Date;
    user_agent?: string;
    ip_address?: string;
  }
  
