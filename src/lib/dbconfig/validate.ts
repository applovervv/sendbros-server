import { ShardRule } from "./reader";

// 빈 배열 체크
export function validateShardingRulesOrShutdown(rules: ShardRule[]) {
    try {
      // 빈 배열 체크
      if (!rules || rules.length === 0) {
        throw new Error('Sharding rules cannot be empty');
      }
  
      // range_min 기준으로 정렬되어 있는지 확인
      for (let i = 0; i < rules.length - 1; i++) {
        const currentRule = rules[i];
        const nextRule = rules[i + 1];
  
        if (currentRule.range_min > nextRule.range_min) {
          throw new Error(
            `CRITICAL ERROR: Sharding rules are not sorted. ` +
            `Found at index ${i}: ${currentRule.range_min} > ${nextRule.range_min}`
          );
        }
      }
  
      console.log('Sharding rules validation passed');
      return true;
  
    } catch (error) {
      console.error('FATAL ERROR:', error);
      console.error('Shutting down server due to invalid sharding configuration');
      
      // 프로세스 종료 (1은 에러 코드를 나타냄)
      process.exit(1);
    }
  }
  
 