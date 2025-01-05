import { AsyncLocalStorage } from 'async_hooks';
import { ShardingTarget } from '../dbconfig/ShardingConfig';

export interface Sharding {
  target: ShardingTarget;
  shardKey: number;
}

interface Context {
  sharding: Sharding | null;
  // 다른 컨텍스트 필드들...
}

export class UserHolder {
  private static asyncLocalStorage = new AsyncLocalStorage<Context>();

  private static getUserContext(): Context {
    let context = this.asyncLocalStorage.getStore();
    if (!context) {
      context = { sharding: null };
      this.asyncLocalStorage.enterWith(context);
    }
    return context;
  }

  static setSharding(target: ShardingTarget, shardKey: number): void {
    const context = this.getUserContext();
    context.sharding = { target, shardKey };
  }

  static clearSharding(): void {
    const context = this.getUserContext();
    context.sharding = null;
  }

  static getSharding(): Sharding | null {
    return this.getUserContext().sharding;
  }

  // 미들웨어로 사용할 수 있는 실행 컨텍스트 래퍼
  static runWithContext<T>(context: Context, fn: () => Promise<T>): Promise<T> {
    return this.asyncLocalStorage.run(context, fn);
  }
} 