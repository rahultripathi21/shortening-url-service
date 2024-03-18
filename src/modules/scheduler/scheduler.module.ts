import { Module } from '@nestjs/common';
import { UrlExpirationJob } from './urlExpiration.job';
import { UrlModule } from '../url/url.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), UrlModule],
  providers: [UrlExpirationJob],
})
export class SchedulerModule {}
