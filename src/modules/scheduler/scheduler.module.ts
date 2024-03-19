import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { UrlExpirationJob } from './urlExpiration.job';
import { UrlModule } from '../url/url.module';

@Module({
  imports: [ScheduleModule.forRoot(), UrlModule],
  providers: [UrlExpirationJob],
})
export class SchedulerModule {}
