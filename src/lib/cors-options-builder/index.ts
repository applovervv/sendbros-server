import { CorsOptions } from "cors";

class CorsOptionsBuilder {
  private options: CorsOptions;
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix.toUpperCase();
    this.options = {
      origin: [],
      methods: [],
      allowedHeaders: [],
      credentials: false,
      maxAge: 86400,
    //   optionsSuccessStatus: 204
    };
  }

  static fromEnv(prefix: string = '') {
    return new CorsOptionsBuilder(prefix).loadEnvConfig().build();
  }

  private getEnvKey(key: string): string {
    return this.prefix ? `${this.prefix}_CORS_${key}` : `CORS_${key}`;
  }

    // env 문자열로 변환
  toEnv(): string {
        const envStrings: string[] = [];
        const addEnvLine = (key: string, value: any) => {
          if (value !== undefined && value !== null) {
            let envValue: string;
            
            if (Array.isArray(value)) {
              envValue = value.join(',');
            } else if (typeof value === 'boolean') {
              envValue = value.toString();
            } else {
              envValue = value.toString();
            }
            
            envStrings.push(`${this.getEnvKey(key)}=${envValue}`);
          }
        };
    
        // 각 옵션을 환경변수 형식으로 변환
        addEnvLine('ALLOWED_ORIGINS', this.options.origin);
        addEnvLine('ALLOWED_METHODS', this.options.methods);
        // addEnvLine('ALLOWED_HEADERS', this.options.allowedHeaders);
        addEnvLine('CREDENTIALS', this.options.credentials);
        addEnvLine('MAX_AGE', this.options.maxAge);
        // addEnvLine('OPTIONS_SUCCESS_STATUS', this.options.optionsSuccessStatus);
    
        return envStrings.join('\n');
      }
    
      // env 파일 생성
     toEnvFile(filePath: string): void {
        const fs = require('fs');
        fs.writeFileSync(filePath, this.toEnv());
      }

  private loadEnvConfig(): CorsOptionsBuilder {
    // Origins 설정
    const origins = process.env[this.getEnvKey('ALLOWED_ORIGINS')];
    if (origins) {
        if(origins === '*') {
            this.options.origin = origins;
        } else {
            this.options.origin = origins.split(',').map(origin => origin.trim());
        }
    }

    // Methods 설정
    const methods = process.env[this.getEnvKey('ALLOWED_METHODS')];
    if (methods) {
        if(methods === '*') {
            this.options.methods = methods;
        } else {
            this.options.methods = methods.split(',').map(method => method.trim());
        }
    } else {
      this.options.methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    }

    // Headers 설정
    const headers = process.env[this.getEnvKey('ALLOWED_HEADERS')];
    if (headers) {
      this.options.allowedHeaders = headers.split(',').map(header => header.trim());
    } else {
      this.options.allowedHeaders = ['Content-Type', 'Authorization'];
    }

    // Credentials 설정
    this.options.credentials = process.env[this.getEnvKey('CREDENTIALS')] === 'true';

    // MaxAge 설정
    const maxAge = process.env[this.getEnvKey('MAX_AGE')];
    if (maxAge) {
      this.options.maxAge = parseInt(maxAge);
    }

    return this;
  }

  build(): CorsOptions {
    // if (!this.options.origin || !Array.isArray(this.options.origin) || this.options.origin.length === 0) {
    //   throw new Error(`${this.getEnvKey('ALLOWED_ORIGINS')} is required in environment variables`);
    // }
    return { ...this.options };
  }
  
  // 옵션 직접 설정 메서드들
  setOrigins(origins: string[]): CorsOptionsBuilder {
    this.options.origin = origins;
    return this;
  }

  setMethods(methods: string[]): CorsOptionsBuilder {
    this.options.methods = methods;
    return this;
  }

  setAllowedHeaders(headers: string[]): CorsOptionsBuilder {
    this.options.allowedHeaders = headers;
    return this;
  }

  setCredentials(credentials: boolean): CorsOptionsBuilder {
    this.options.credentials = credentials;
    return this;
  }

  setMaxAge(maxAge: number): CorsOptionsBuilder {
    this.options.maxAge = maxAge;
    return this;
  }

    // 기존 cors 옵션으로부터 생성
  static fromOptions(options: Partial<CorsOptions>, prefix: string = ''): CorsOptionsBuilder {
      const builder = new CorsOptionsBuilder(prefix);
      
      if (options.origin) {
        // origin이 함수나 문자열, 배열일 수 있음
        if (typeof options.origin === 'function') {
          console.warn('Function type origin cannot be converted to env format');
        } else if (typeof options.origin === 'string') {
          builder.setOrigins([options.origin]);
        } else if (Array.isArray(options.origin)) {
          builder.setOrigins(options.origin as string[]);
        }
      }
  
      if (options.methods) {
        builder.setMethods(Array.isArray(options.methods) ? options.methods : [options.methods]);
      }
  
      if (options.allowedHeaders) {
        builder.setAllowedHeaders(Array.isArray(options.allowedHeaders) ? options.allowedHeaders : [options.allowedHeaders]);
      }
  
      if (options.credentials !== undefined) {
        builder.setCredentials(options.credentials);
      }
  
      if (options.maxAge !== undefined) {
        builder.setMaxAge(options.maxAge);
      }
  
    //   if (options.optionsSuccessStatus !== undefined) {
    //     builder.options.optionsSuccessStatus = options.optionsSuccessStatus;
    //   }
  
      return builder;
    }

}


export default CorsOptionsBuilder;