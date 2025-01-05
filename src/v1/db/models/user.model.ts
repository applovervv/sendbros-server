export interface User {
    id?: number; //auto generated
    username: string; //required
    email: string; //required 
    password_hash: string; //required
    is_email_verified?: boolean; //auto generated , default : false
    profile_image_url?: string; //optional
    refresh_token?: string; //optional
    created_at?: Date; //auto generated
    last_login_at?: Date; //optional
    deleted_at?: Date; //optional
  }
  

