import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HelperService } from './helper.service';
import { RedisService } from './redis.service';

@Module({
  imports: [],
  providers: [HelperService, RedisService, ConfigService],
  exports: [HelperService, RedisService],
})
export class HelperModule {}
