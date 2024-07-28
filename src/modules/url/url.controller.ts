import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as useragent from 'express-useragent';

import { UrlService } from './url.service';
import { ShortenUrlDTO } from './url.dto';
import { Auth, GetUserData } from '../../middlewares/auth.middleware';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('url')
@ApiTags('URL')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiBearerAuth()
  @ApiBody({ type: ShortenUrlDTO })
  @ApiResponse({
    status: 201,
    description: 'Shortened URL created successfully',
    schema: {
      properties: {
        shortUrl: { type: 'string', description: 'Shortened URL' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Auth()
  async shortenUrl(@Body() { url }: ShortenUrlDTO, @GetUserData() user) {
    return this.urlService.shortenUrl(url, user._id);
  }

  @Get('link/:urlCode')
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User URLs fetched successfully',
    schema: {
      properties: {
        urls: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Auth()
  async fetchUserUrls(@GetUserData() user) {
    return this.urlService.fetchUserUrls(user._id);
  }

  @Get('url-analytics/:urlId')
  @ApiBearerAuth()
  @ApiParam({
    name: 'urlId',
    description: 'The ID of the URL for analytics',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'URL analytics fetched successfully',
    schema: {
      properties: {
        analytics: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Auth()
  async urlAnalytics(@Param('urlId') urlId: string, @GetUserData() user) {
    return this.urlService.urlAnalytics(urlId, user._id);
  }
}
