import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UrlService } from '../url/url.service';

@Injectable()
export class UrlExpirationJob {
  constructor(private readonly urlService: UrlService) {}

  @Cron(CronExpression.EVERY_WEEKEND)
  async autoDeletionUrls() {
    try {
      await this.urlService.autoDeletionUrls();
    } catch (error) {
      Logger.error('While deleting expired urls');
    }
  }
}
