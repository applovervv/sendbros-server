/**
 * Environment types supported by runmode
 */
export type Environment = 'production' | 'development' | 'test' | 'staging';

/**
 * Configuration options for runmode
 */
export interface RunModeConfig {
  /**
   * Custom environment variable name (default: 'NODE_ENV')
   */
  envKey?: string;
  
  /**
   * Default environment when not specified
   */
  defaultEnv?: Environment;
  
  /**
   * Additional custom environments
   */
  customEnvs?: string[];
}

class RunMode {
  private envKey: string;
  private defaultEnv: Environment;
  private customEnvs: string[];

  constructor(config: RunModeConfig = {}) {
    this.envKey = config.envKey || 'NODE_ENV';
    this.defaultEnv = config.defaultEnv || 'development';
    this.customEnvs = config.customEnvs || [];
  }

  /**
   * Get current environment
   */
  current(): string {
    return process.env[this.envKey] || this.defaultEnv;
  }

  /**
   * Check if current environment is production
   */
  isProduction(): boolean {
    return this.current() === 'production';
  }

  /**
   * Check if current environment is development
   */
  isDevelopment(): boolean {
    return this.current() === 'development';
  }

  /**
   * Check if current environment is test
   */
  isTest(): boolean {
    return this.current() === 'test';
  }

  /**
   * Check if current environment is staging
   */
  isStaging(): boolean {
    return this.current() === 'staging';
  }

  /**
   * Check if current environment matches the given environment
   */
  is(env: string): boolean {
    return this.current() === env;
  }

  /**
   * Check if current environment is one of the given environments
   */
  isOneOf(envs: string[]): boolean {
    return envs.includes(this.current());
  }

  /**
   * Check if environment is valid
   */
  isValidEnv(env: string): boolean {
    const validEnvs: string[] = [
      'production',
      'development',
      'test',
      'staging',
      ...this.customEnvs
    ];
    return validEnvs.includes(env);
  }

  /**
   * Execute callback only in specific environment
   */
  when(env: string | string[], callback: () => void): void {
    const envs = Array.isArray(env) ? env : [env];
    if (this.isOneOf(envs)) {
      callback();
    }
  }

  /**
   * Execute callback in all environments except specified ones
   */
  unless(env: string | string[], callback: () => void): void {
    const envs = Array.isArray(env) ? env : [env];
    if (!this.isOneOf(envs)) {
      callback();
    }
  }

  /**
   * Get configuration for different environments
   */
  switch<T>(cases: { [key: string]: T }, defaultCase?: T): T {
    const currentEnv = this.current();
    if (!(currentEnv in cases) && defaultCase === undefined) {
      throw new Error(`No case matched for environment '${currentEnv}' and no default case provided`);
    }
    return cases[currentEnv] ?? defaultCase!;
  }
}

// Create default instance
const defaultInstance = new RunMode();

// Export default instance and class
export default defaultInstance;
export { RunMode };

// Export type-guard functions
export const isProduction = (): boolean => defaultInstance.isProduction();
export const isDevelopment = (): boolean => defaultInstance.isDevelopment();
export const isTest = (): boolean => defaultInstance.isTest();
export const isStaging = (): boolean => defaultInstance.isStaging();
export const current = (): string => defaultInstance.current();