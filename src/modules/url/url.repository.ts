import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { IUrlAnalyticsDoc, IUrlDoc } from './url.interface';
import { ANALYTICS_SCHEMA_NAME, URL_SCHEMA_NAME } from './url.schema';

@Injectable()
export class UrlRepository {
  constructor(
    @InjectModel(URL_SCHEMA_NAME)
    private readonly urlModel: Model<IUrlDoc>,
    @InjectModel(ANALYTICS_SCHEMA_NAME)
    private readonly analyticModel: Model<IUrlAnalyticsDoc>,
  ) {}

  // Url queries
  async addUrlData(urlData) {
    return this.urlModel.create(urlData);
  }

  async updateUrlData(query, data) {
    return await this.urlModel.updateOne(query, data);
  }

  async findUrl(query): Promise<IUrlDoc> {
    return this.urlModel.findOne(query);
  }

  async findUrls(query): Promise<IUrlDoc[]> {
    return this.urlModel.find(query);
  }

  async deleteUrls(query) {
    return this.urlModel.deleteMany(query);
  }

  // Analytics queries
  async createAnalytics(analyticsData) {
    return await this.analyticModel.create(analyticsData);
  }

  async findAnalyticsData(query): Promise<IUrlAnalyticsDoc> {
    return this.analyticModel.findOne(query);
  }

  async deleteAnalytics(query) {
    return this.analyticModel.deleteMany(query);
  }

  async fetchUrlBrowserData(urlId) {
    const browserData = await this.analyticModel.aggregate([
      { $match: { url: new mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: '$browserType',
          totalCount: { $sum: 1 },
        },
      },
      {
        $project: {
          browserName: '$_id',
          totalCount: 1,
          _id: 0,
        },
      },
    ]);

    return browserData.map(({ browserName, totalCount }) => ({
      browserName,
      totalCount,
    }));
  }

  async fetchUrlReferrersData(urlId) {
    const referralSourceData = await this.analyticModel.aggregate([
      { $match: { url: new mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: '$referralSource',
          totalCount: { $sum: 1 },
        },
      },
      {
        $project: {
          referralSource: '$_id',
          totalCount: 1,
          _id: 0,
        },
      },
    ]);

    return referralSourceData.map(({ referralSource, totalCount }) => ({
      referralSource,
      totalCount,
    }));
  }

  async fetchUrlDevicesData(urlId) {
    const deviceTypeData = await this.analyticModel.aggregate([
      { $match: { url: new mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: '$deviceType',
          totalCount: { $sum: 1 },
        },
      },
      {
        $project: {
          deviceType: '$_id',
          totalCount: 1,
          _id: 0,
        },
      },
    ]);

    return deviceTypeData.map(({ deviceType, totalCount }) => ({
      deviceType,
      totalCount,
    }));
  }

  async getPeakHoursForUrl(urlId) {
    const peakHourData = await this.analyticModel.aggregate([
      { $match: { url: new mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: {
            hour: { $hour: { $toDate: '$createdAt' } },
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: { $toDate: '$createdAt' },
              },
            },
          },
          hitCount: { $sum: 1 },
        },
      },
      { $sort: { hitCount: -1 } },
    ]);

    const peakHoursByDate = {};
    peakHourData.forEach((entry) => {
      const { hour, date } = entry._id;
      const ampmHour =
        hour < 12 ? `${hour} AM` : `${hour === 12 ? 12 : hour - 12} PM`;
      if (
        !peakHoursByDate[date] ||
        peakHoursByDate[date].hitCount < entry.hitCount
      ) {
        peakHoursByDate[date] = { hour: ampmHour, hitCount: entry.hitCount };
      }
    });

    return peakHoursByDate;
  }
}
