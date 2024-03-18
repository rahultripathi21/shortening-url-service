import { Module } from '@nestjs/common';
import { AnalyticSchemaModule, UrlSchemaModule } from './url.schema';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';
import { HelperModule } from '../helper/helper.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UrlSchemaModule, AnalyticSchemaModule, HelperModule, UserModule],
  controllers: [UrlController],
  providers: [UrlService, UrlRepository],
  exports: [UrlService],
})
export class UrlModule {}
