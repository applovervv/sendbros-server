import { Pool,PoolConfig } from "pg";
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
});


export { pool };
