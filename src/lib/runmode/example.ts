// 기본 사용
import runmode from '.';

if (runmode.isProduction()) {
  // production 환경에서만 실행
}

// 커스텀 설정으로 사용
import { RunMode } from '.';

const customRunmode = new RunMode({
  envKey: 'APP_ENV',
  defaultEnv: 'development',
  customEnvs: ['qa', 'uat']
});

// 환경별 설정 적용
const config = runmode.switch({
  production: { api: 'https://api.prod.com' },
  development: { api: 'http://localhost:3000' },
  staging: { api: 'https://api.staging.com' }
});

// 특정 환경에서만 실행
runmode.when('production', () => {
  console.log('프로덕션 환경에서만 실행됩니다');
});

// 여러 환경 체크
runmode.isOneOf(['development', 'test']); // boolean 반환