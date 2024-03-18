import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private rClient: any;
  private expirationTime: any;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL');
    this.rClient = createClient({ url });
    this.connectRedis();
  }

  async connectRedis(): Promise<void> {
    try {
      await this.rClient.connect();
    } catch (error) {
      Logger.error(`Error while connecting to Redis server: ${error.message}`);
    }
  }

  async setDataInRedis(
    hashKey: string,
    subKey: string,
    data: string,
  ): Promise<void> {
    this.rClient.HSET(hashKey, subKey, data);
  }

  async getDataFromRedis(hashKey: string, subKey: string): Promise<string> {
    return this.rClient.HGET(hashKey, subKey);
  }

  async deleteDataFromRedis(hashKey: string, subKey: string): Promise<void> {
    return this.rClient.HDEL(hashKey, subKey);
  }
}
