import { Pool, PoolClient, PoolConfig } from 'pg';
import { Config,Datasource } from './reader';
import { Property } from './reader';
import { DataSourceRouter } from './DataSourceRouter';

import { pool as defaultPool } from '../dbconn';
import { ShardingConfig } from './ShardingConfig';


export class FriendConfig {
  /*
TRUNCATE TABLE users CASCADE;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
  */


} 

export async function getShard(tableName: string, pkName: string, pkValue?: number | null ): Promise<Pool> {
    // let previous_last_value = 0;

    for(let i = 0; i < ShardingConfig.pools.length; i++) {

        const pool = ShardingConfig.pools[i];
        const shard = ShardingConfig.shards[i];

        const last_value = await pool.query(`SELECT last_value FROM ${tableName}_${pkName}_seq`)
        
        const current_last_value = last_value.rows[0].last_value;

        //offset: 3 limit : 10 last_value: 1
        // 10 >= 3 && 1 < 13

        // 0 1000 ( 0 <= 1000 <= 1000  )
        /// 1001 5001 (  1001 <= 1000 <= 5001  )
        /// 5001 9223372036854775807

        if(pkValue && shard.rule.range_min <= pkValue && pkValue <= shard.rule.range_max) {
            return pool;
        }
        
        // 0 1000 ( 0 <= 1000 <= 1000  )
        /// 1001 5001 (  1001 <= 1000 <= 5001  )
        /// 5001 9223372036854775807

        if(shard.rule.range_max <= current_last_value ) {
            continue;
        }
        
        const ifFirstInsersion = shard.rule.range_min > 0 && current_last_value == 1;

        if(ifFirstInsersion) {
            console.log("this is first insersion!!")
            await pool.query(`ALTER SEQUENCE ${tableName}_${pkName}_seq RESTART WITH ${shard.rule.range_min}`)       
        }

        // console.log("previous_last_value", previous_last_value)
        // console.log("current_last_value", current_last_value)
        console.log("this is shard", shard)

        return pool;
    }

    console.log("this is default pool", defaultPool)
    return defaultPool;
  }

