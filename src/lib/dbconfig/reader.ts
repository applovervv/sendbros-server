import { load } from 'js-yaml';
import { readFileSync } from 'fs';


interface Property {
  name: string;
  url: string;
}

interface Shard {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  rule: ShardRule;
//   master: Property;
//   slaves: Property[];
}

// interface ShardingDataSourceProperty {
//   shards: Shard[];
// }

// interface Friend {
//   shards: Shard[];
// }

interface Datasource {
  shards: Shard[];
  strategy: ShardingStrategyType;
}

interface ShardRule {
  shard_no: number;
  range_min: number;
  range_max: number;
}

enum ShardingStrategyType {
  RANGE = 'RANGE',
  MODULAR = 'MODULAR'
}

// interface ShardingStrategy {
//   strategy: ShardingStrategyType;
//   rules: ShardRule[];
//   mod: number;
// }

// interface Sharding {
//   friend: ShardingStrategy;
// }

interface Config {
  datasource: Datasource;
//   sharding: Sharding;
}


interface FileReader{
    read(path: string): string;
}

interface ConfigParser<T>{
    parse(content: string): T;
}

class YamlFileReader implements FileReader {
    read(path: string): string {
        return readFileSync(path, 'utf8');
    }
}

class YamlConfigParser implements ConfigParser<Config> {
    parse(content: string): Config {
        return load(content) as Config;
    }
}

abstract class AbstractDbConfigReader<T> {
    constructor(
        protected readonly fileReader: FileReader,
        protected readonly parser: ConfigParser<T>
    ) {}

    abstract read(): T;
}


class DbConfigReader extends AbstractDbConfigReader<Config> {
    constructor(
        private readonly configFilePath: string,
        fileReader: FileReader,
        parser: ConfigParser<Config>
    ) {
        super(fileReader, parser);
    }

    read(): Config {
        const content = this.fileReader.read(this.configFilePath);
        return this.parser.parse(content);
    }
}

// 사용 예시
export const createDbConfigReader = (configPath: string): DbConfigReader => {
    const fileReader = new YamlFileReader();
    const parser = new YamlConfigParser();
    return new DbConfigReader(configPath, fileReader, parser);
};

export {  Shard, Datasource ,DbConfigReader, FileReader, ConfigParser, Config,Property ,ShardRule, ShardingStrategyType};

