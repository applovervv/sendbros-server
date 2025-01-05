// // import { ShardingStrategy } from './reader';

import { Pool, PoolConfig } from "pg";
import { createDbConfigReader, Shard } from "./reader";

// // 샤딩 대상을 정의하는 enum
// export enum ShardingTarget {
//   FRIEND = 'friend'
//   // 필요한 다른 타겟들 추가
// }

// export class ShardingConfig {
//   private static shardingPropertyMap: Map<ShardingTarget, ShardingStrategy> = new Map();

//   static setShardingProperty(target: ShardingTarget, property: ShardingStrategy): void {
//     this.shardingPropertyMap.set(target, property);
//   }

//   static getShardingPropertyMap(): Map<ShardingTarget, ShardingStrategy> {
//     return this.shardingPropertyMap;
//   }

//   // Java의 ConcurrentHashMap과 유사한 동시성 처리를 위한 메서드들
//   static clear(): void {
//     this.shardingPropertyMap.clear();
//   }

//   static delete(target: ShardingTarget): boolean {
//     return this.shardingPropertyMap.delete(target);
//   }

//   static has(target: ShardingTarget): boolean {
//     return this.shardingPropertyMap.has(target);
//   }
// } 


export class ShardingConfig {
    static pools: Pool[] = []
    static shards: Shard[] = []

    static validateShardRules(shards: any[]): void {
        if (!shards.length) {
            throw new Error('No shards defined');
        }

        // 정렬된 샤드들을 순회하며 검증
        for (let i = 0; i < shards.length; i++) {
            const currentShard = shards[i];
            const nextShard = shards[i + 1];

            // range_min과 range_max가 숫자인지 확인
            if (typeof currentShard.rule.range_min !== 'number' || 
                typeof currentShard.rule.range_max !== 'number') {
                throw new Error(`Shard ${currentShard.shard_no}: range_min and range_max must be numbers`);
            }

            // range_min이 range_max보다 작은지 확인
            if (currentShard.rule.range_min >= currentShard.rule.range_max) {
                throw new Error(
                    `Shard ${currentShard.shard_no}: range_min (${currentShard.rule.range_min}) ` +
                    `must be less than range_max (${currentShard.rule.range_max})`
                );
            }

            // 다음 샤드가 있는 경우, 범위가 연속적인지 확인
            if (nextShard) {
                if (currentShard.rule.range_max + 1 !== nextShard.rule.range_min) {
                    throw new Error(
                        `Gap or overlap detected between shard ${currentShard.shard_no} ` +
                        `(max: ${currentShard.rule.range_max}) and shard ${nextShard.shard_no} ` +
                        `(min: ${nextShard.rule.range_min})`
                    );
                }
            }
        }

        console.log('Shard rules validation passed successfully');
    }

    static async initialize() {
        const dbConfig = createDbConfigReader('./dbconfig.yaml').read()

        // this.shards = [...dbConfig.datasource.shards];

        // console.log("Original shards:", dbConfig.datasource.shards);
         // range_min을 기준으로 정렬
        this.shards = [...dbConfig.datasource.shards].sort((a, b) => 
            (a.rule.range_min as number) - (b.rule.range_min as number)
        );

        // 정렬된 샤드 규칙 검증
        try {
            this.validateShardRules(this.shards);
        } catch (error) {
            console.error('Shard validation failed:', error);
            process.exit(1); // 심각한 설정 오류이므로 프로세스 종료
        }

        // console.log("Sorted and validated shards:", this.shards);
    

        // console.log("fuck",this.shards)
        for(const shard of this.shards) {
            const pool = this.createDataSource(shard.username.toString(), shard.password.toString(), shard.host.toString(), shard.port, shard.database.toString())
      
            // this.shards.push(shard)
            this.pools.push(pool)
        }
}


   private static createDataSource(username: string, password: string, host: string, port: number, database: string): Pool {
        const config: PoolConfig = {
        user: username,
        password: password,
        host: host,
        port: port,
        database: database,
        };
        return new Pool(config);
    }
}