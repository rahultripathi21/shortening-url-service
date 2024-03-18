import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { RedisService } from './redis.service';

@Module({
  imports: [],
  providers: [HelperService, RedisService],
  exports: [HelperService, RedisService],
})
export class HelperModule {}
