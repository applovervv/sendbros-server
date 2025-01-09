import CorsOptionsBuilder from ".";

// 사용 예시
const express = require('express');
const cors = require('cors');
const app = express();

try {
  // 기본 CORS 설정
  const defaultCorsOptions = CorsOptionsBuilder.fromEnv();
  app.use(cors(defaultCorsOptions));

  // API 전용 CORS 설정
  const apiCorsOptions = CorsOptionsBuilder.fromEnv('API');
  app.use('/api', cors(apiCorsOptions));

  // Admin 전용 CORS 설정
  const adminCorsOptions = CorsOptionsBuilder.fromEnv('ADMIN');
  app.use('/admin', cors(adminCorsOptions));

} catch (error) {
  console.error('CORS configuration error:', error);
  process.exit(1);
}


/*

# 기본 CORS 설정
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# API 전용 CORS 설정
API_CORS_ALLOWED_ORIGINS=https://api.your-app.com
API_CORS_ALLOWED_METHODS=GET,POST
API_CORS_ALLOWED_HEADERS=Content-Type,Authorization
API_CORS_CREDENTIALS=true
API_CORS_MAX_AGE=3600

# Admin 전용 CORS 설정
ADMIN_CORS_ALLOWED_ORIGINS=https://admin.your-app.com
ADMIN_CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH
ADMIN_CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Admin-Token
ADMIN_CORS_CREDENTIALS=true
ADMIN_CORS_MAX_AGE=7200

*/