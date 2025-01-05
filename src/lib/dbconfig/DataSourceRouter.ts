import { Pool, PoolClient } from 'pg';
import { ShardingStrategyType, ShardRule } from './reader';
// import { ShardingConfig } from './ShardingConfig';
import { Sharding, UserHolder } from '../context/UserHolder';

const SHARD_DELIMITER = '_';

class RoundRobin<T> {
  private items: T[] = [];
  private currentIndex = 0;

  constructor(items: T[]) {
    this.items = items;
  }

  add(item: T): void {
    this.items.push(item);
  }
  next(): T {
    if (this.items.length === 0) throw new Error('No items available');
    const item = this.items[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    return item;
  }
}

class MhaDataSource {
  masterName: string = '';
  slaveName: RoundRobin<string>;

  constructor() {
    this.slaveName = new RoundRobin<string>([]);
  }
}

export class DataSourceRouter {
  private pools: Pool[] = [];
    currentPool: Pool | undefined;
 
  setTargetDataSources(pools: Pool[]): void {
    this.pools = pools;

    for (const pool of pools) {
        console.log(pool)
        
    //   const shardNoStr = dataSourceName.split(SHARD_DELIMITER)[0];
    //   const shard = this.getShard(shardNoStr);

     
    }
  }

//   determineCurrentLookupKey(): string {
//     const sharding = UserHolder.getSharding();
//     if(sharding === null) {
//       throw new Error('Sharding not found');
//     }

//     // const shardNo = this.getShardNo(sharding);
//     // const dataSource = this.shards.get(shardNo);

//     if(dataSource === undefined) {
//       throw new Error('DataSource not found');
//     }
//     // 트랜잭션 읽기 전용 여부는 별도로 구현 필요
//     const isReadOnly = false; // TransactionSynchronizationManager.isCurrentTransactionReadOnly() 대체 필요
//     return isReadOnly ? dataSource.slaveName.next() : dataSource.masterName;
//   }

//  getShard(shardNoStr: string): Pool {
//     const shardNo = Number.isInteger(Number(shardNoStr)) ? parseInt(shardNoStr) : 0;
    
//     let shard = this.shards.get(shardNo);
//     if (!shard) {
//       shard = new MhaDataSource();
//       this.shards.set(shardNo, shard);
//     }

//     return shard;
//   }

//   private getShardNo(sharding: Sharding): number {
//     if (!sharding) return 0;

//     let shardNo = 0;
//     const shardingProperty = ShardingConfig.getShardingPropertyMap().get(sharding.target);
    
//     if(shardingProperty === undefined) {
//       throw new Error('Sharding property not found');
//     }

//     if (shardingProperty.strategy === ShardingStrategyType.RANGE) {
//       shardNo = this.getShardNoByRange(shardingProperty.rules, sharding.shardKey);
//     } else if (shardingProperty.strategy === ShardingStrategyType.MODULAR) {
//       shardNo = this.getShardNoByModular(shardingProperty.mod, sharding.shardKey);
//     }

//     return shardNo;
//   }

  private getShardNoByRange(rule: ShardRule, shardKey: number): number {
    // for (const rule of rules) {
    if (rule.range_min <= shardKey && shardKey <= rule.range_max) {
        return rule.shard_no;
    }
    // }
    return 0;
  }

  private getShardNoByModular(modulus: number, shardKey: number): number {
    return shardKey % modulus;
  }

//   afterPropertiesSet(): void {
//     // 초기화 로직 구현
//     this.currentPool = this.targetDataSources.get(this.determineCurrentLookupKey());

//   }


  // ... 기타 필요한 Pool 속성들 구현
} 