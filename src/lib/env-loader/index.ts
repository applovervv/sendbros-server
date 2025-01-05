import path from 'path';
import { config as dotenvConfig } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}.local`);

// 환경 변수 로드
dotenvConfig({ path: envPath });

console.log(`lib/env-loader: Running in ${NODE_ENV} mode using env file: ${envPath}`);