import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as useragent from 'express-useragent';

import { UrlService } from './url.service';
import { ShortenUrlDTO } from './url.dto';
import { Auth, GetUserData } from '../../middlewares/auth.middleware';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @Auth()
  async shortenUrl(@Body() { url }: ShortenUrlDTO, @GetUserData() user) {
    return this.urlService.shortenUrl(url, user._id);
  }

  @Get('link/:urlCode')
  async requestUrl(
    @Param('urlCode') urlCode: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const userAgent = useragent.parse(request.headers['user-agent']);
    const referralSource = request.headers['referer']?.toString();
    const browserType = userAgent?.browser.toLowerCase() || 'other';
    const deviceType = userAgent.isMobile
      ? 'mobile'
      : userAgent.isDesktop
        ? 'desktop'
        : 'Unknown';

    const { redirectUrl } = await this.urlService.requestUrl({
      urlCode: urlCode,
      referralSource,
      browserType,
      deviceType,
    });

    response.redirect(redirectUrl);
  }

  @Get('user-urls')
  @Auth()
  async fetchUserUrls(@GetUserData() user) {
    return this.urlService.fetchUserUrls(user._id);
  }

  @Get('url-analytics/:urlId')
  @Auth()
  async urlAnalytics(@Param('urlId') urlId: string, @GetUserData() user) {
    return this.urlService.urlAnalytics(urlId, user._id);
  }
}
