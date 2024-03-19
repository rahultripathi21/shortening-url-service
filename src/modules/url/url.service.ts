import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

import { UrlRepository } from './url.repository';
import { IUrlInputs } from './url.interface';
import { HelperService } from '../helper/helper.service';
import { RedisService } from '../helper/redis.service';

@Injectable()
export class UrlService {
  private readonly urlHashKey;

  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly helperService: HelperService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.urlHashKey = this.configService.get<string>('URL_HASH_KEY');
  }

  async shortenUrl(url: string, user) {
    try {
      let urlCode;
      const urlExist = await this.urlRepository.findUrl({
        originalURL: url,
        user: new mongoose.Types.ObjectId(user),
      });
      if (urlExist) {
        urlCode = urlExist.urlCode;
      } else {
        urlCode = this.helperService.generateShortCode();
        const urlDataToAdd = {
          originalURL: url,
          shortURL: `${this.configService.get('SHORT_URL_PREFIX')}link/${urlCode}`,
          urlCode,
          user,
        };

        const urlData = await this.urlRepository.addUrlData(urlDataToAdd);
        await this.redisService.setDataInRedis(
          this.urlHashKey,
          urlCode,
          JSON.stringify({
            urlId: urlData._id.toString(),
            url,
          }),
        );
      }
      return {
        shortUrl: `${this.configService.get('SHORT_URL_PREFIX')}link/${urlCode}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async requestUrl({
    urlCode,
    referralSource,
    browserType,
    deviceType,
  }: IUrlInputs) {
    try {
      let redirectUrl, urlId;

      const redisUrlData = JSON.parse(
        await this.redisService.getDataFromRedis(this.urlHashKey, urlCode),
      );

      if (redisUrlData) {
        redirectUrl = redisUrlData?.url;
        urlId = redisUrlData.urlId;
      } else {
        const urlExist = await this.urlRepository.findUrl({
          urlCode,
        });
        if (!urlExist) throw new NotFoundException('Url not found');

        urlId = urlExist._id;
        await this.redisService.setDataInRedis(
          this.urlHashKey,
          urlCode,
          JSON.stringify({
            urlId: urlExist._id.toString(),
            url: urlExist.originalURL,
          }),
        );
        redirectUrl = urlExist.originalURL;
      }

      this.urlRepository.updateUrlData(
        { _id: urlId },
        { $inc: { clickCount: 1 }, lastClickedAt: Date.now() },
      );

      const analyticsData = {
        referralSource,
        browserType,
        deviceType,
        url: urlId,
      };

      this.urlRepository.createAnalytics(analyticsData);
      return {
        redirectUrl,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async fetchUserUrls(user) {
    try {
      const urls = await this.urlRepository.findUrls({
        user: new mongoose.Types.ObjectId(user),
      });
      return {
        urls: urls || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async urlAnalytics(url: string, user) {
    try {
      const analytics = {};
      const urlExist = await this.urlRepository.findUrl({
        _id: new mongoose.Types.ObjectId(url),
      });

      if (!urlExist) throw new NotFoundException('Url Not Found');

      if (user !== urlExist.user.toString())
        throw new BadRequestException('Invalid Url user');
      analytics['clickCount'] = urlExist.clickCount;
      const [referrersData, browsersData, devicesData, peakHours] =
        await Promise.all([
          this.urlRepository.fetchUrlReferrersData(url),
          this.urlRepository.fetchUrlBrowserData(url),
          this.urlRepository.fetchUrlDevicesData(url),
          this.urlRepository.getPeakHoursForUrl(url),
        ]);
      analytics['referrersData'] = referrersData || [];
      analytics['browsersData'] = browsersData || [];
      analytics['devicesData'] = devicesData || [];
      analytics['peakHours'] = peakHours;
      return {
        analytics,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async autoDeletionUrls() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const query = { createdAt: { $lte: oneWeekAgo } };

    const urlsToDelete = await this.urlRepository.findUrls(query);

    const urlIds = urlsToDelete.map((url) => url._id);

    const redisDeletePromises = urlsToDelete.map((url) =>
      this.redisService.deleteDataFromRedis(this.urlHashKey, url.urlCode),
    );
    const analyticsDeleteQuery = { url: { $in: urlIds } };
    await Promise.all([
      this.urlRepository.deleteUrls(query),
      this.urlRepository.deleteAnalytics(analyticsDeleteQuery),
      ...redisDeletePromises,
    ]);
  }
}
