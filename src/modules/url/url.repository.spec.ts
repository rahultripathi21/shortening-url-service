import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { UrlRepository } from './url.repository';
import { URL_SCHEMA_NAME, ANALYTICS_SCHEMA_NAME } from './url.schema';
import { IUrlAnalyticsDoc, IUrlDoc } from './url.interface';

describe('UrlRepository', () => {
  let urlRepository: UrlRepository;
  let urlModel: Model<IUrlDoc>;
  let analyticModel: Model<IUrlAnalyticsDoc>;

  const mockUrl = {
    _id: '61c0ccf11d7bf83d153d7c06',
    originalURL: 'https://example.com',
    urlCode: 'abc123',
    shortURL: 'https://short.url/abc123',
    clickCount: 0,
    lastClickedAt: new Date(),
    user: '61c0ccf11d7bf83d153d7111',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAnalytics = {
    _id: '61c0ccf11d7bf83d153d7c07',
    url: mockUrl._id,
    referralSource: 'direct',
    browserType: 'Chrome',
    deviceType: 'Desktop',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUrlRepository = {
    create: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlRepository,
        {
          provide: getModelToken(URL_SCHEMA_NAME),
          useValue: mockUrlRepository,
        },
        {
          provide: getModelToken(ANALYTICS_SCHEMA_NAME),
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    urlRepository = module.get<UrlRepository>(UrlRepository);
    urlModel = module.get<Model<IUrlDoc>>(getModelToken(URL_SCHEMA_NAME));
    analyticModel = module.get<Model<IUrlAnalyticsDoc>>(
      getModelToken(ANALYTICS_SCHEMA_NAME),
    );
  });

  it('should be defined', () => {
    expect(urlRepository).toBeDefined();
  });

  describe('addUrlData', () => {
    it('should add URL data', async () => {
      const urlData = {
        originalURL: 'https://example.com',
        urlCode: 'abc123',
        shortURL: 'https://short.url/abc123',
        clickCount: 0,
        lastClickedAt: new Date(),
        user: '61c0ccf11d7bf83d153d7c06',
      };

      jest.spyOn(urlModel, 'create').mockResolvedValueOnce(mockUrl as any);

      const result = await urlRepository.addUrlData(urlData);

      expect(urlModel.create).toHaveBeenCalledWith(urlData);
      expect(result).toEqual(mockUrl);
    });
  });

  describe('updateUrlData', () => {
    it('should update URL data', async () => {
      const query = { urlCode: 'abc123' };
      const data = { clickCount: 1 };

      jest.spyOn(urlModel, 'updateOne').mockResolvedValueOnce({} as any);

      const result = await urlRepository.updateUrlData(query, data);

      expect(urlModel.updateOne).toHaveBeenCalledWith(query, data);
      expect(result).toEqual({});
    });
  });

  it('should be defined', () => {
    expect(urlRepository).toBeDefined();
  });

  describe('findUrl', () => {
    it('should find a URL', async () => {
      const query = { urlCode: 'abc123' };

      jest.spyOn(urlModel, 'findOne').mockResolvedValueOnce(mockUrl as any);

      const result = await urlRepository.findUrl(query);

      expect(urlModel.findOne).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockUrl);
    });
  });

  describe('findUrls', () => {
    it('should find multiple URLs', async () => {
      const query = { user: '61c0ccf11d7bf83d153d7c06' };
      const mockUrls = [mockUrl._id];

      jest.spyOn(urlModel, 'find').mockResolvedValueOnce(mockUrls as any);

      const result = await urlRepository.findUrls(query);

      expect(urlModel.find).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockUrls);
    });
  });

  describe('deleteUrls', () => {
    it('should delete URLs', async () => {
      const query = { user: '61c0ccf11d7bf83d153d7c06' };

      jest.spyOn(urlModel, 'deleteMany').mockResolvedValueOnce({} as any);

      const result = await urlRepository.deleteUrls(query);

      expect(urlModel.deleteMany).toHaveBeenCalledWith(query);
      expect(result).toEqual({});
    });
  });

  describe('createAnalytics', () => {
    it('should create analytics data', async () => {
      const analyticsData = {
        url: '61c0ccf11d7bf83d153d7c06',
        referralSource: 'direct',
        browserType: 'Chrome',
        deviceType: 'Desktop',
      };

      jest
        .spyOn(analyticModel, 'create')
        .mockResolvedValueOnce(mockAnalytics as any);

      const result = await urlRepository.createAnalytics(analyticsData);

      expect(analyticModel.create).toHaveBeenCalledWith(analyticsData);
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('findAnalyticsData', () => {
    it('should find analytics data', async () => {
      const query = { url: '61c0ccf11d7bf83d153d7c06' };

      jest
        .spyOn(analyticModel, 'findOne')
        .mockResolvedValueOnce(mockAnalytics as any);

      const result = await urlRepository.findAnalyticsData(query);

      expect(analyticModel.findOne).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('deleteAnalytics', () => {
    it('should delete analytics data', async () => {
      const query = { url: '61c0ccf11d7bf83d153d7c06' };

      jest.spyOn(analyticModel, 'deleteMany').mockResolvedValueOnce({} as any);

      const result = await urlRepository.deleteAnalytics(query);

      expect(analyticModel.deleteMany).toHaveBeenCalledWith(query);
      expect(result).toEqual({});
    });
  });

  describe('fetchUrlBrowserData', () => {
    it('should fetch browser data for a given URL', async () => {
      const urlId = '61c0ccf11d7bf83d153d7c06';
      const mockBrowserData = [
        { browserName: 'Chrome', totalCount: 10 },
        { browserName: 'Firefox', totalCount: 8 },
      ];

      jest
        .spyOn(analyticModel, 'aggregate')
        .mockReturnValueOnce(mockBrowserData as any);

      const result = await urlRepository.fetchUrlBrowserData(urlId);

      expect(analyticModel.aggregate).toHaveBeenCalledWith([
        { $match: { url: expect.any(Object) } },
        { $group: { _id: '$browserType', totalCount: { $sum: 1 } } },
        { $project: { browserName: '$_id', totalCount: 1, _id: 0 } },
      ]);
      expect(result).toEqual(mockBrowserData);
    });
  });

  describe('fetchUrlReferrersData', () => {
    it('should fetch referral source data for a given URL', async () => {
      const urlId = '61c0ccf11d7bf83d153d7c06';
      const mockReferralSourceData = [
        { referralSource: 'Google', totalCount: 10 },
        { referralSource: 'Direct', totalCount: 5 },
      ];

      jest
        .spyOn(analyticModel, 'aggregate')
        .mockResolvedValueOnce(mockReferralSourceData);

      const result = await urlRepository.fetchUrlReferrersData(urlId);

      expect(analyticModel.aggregate).toHaveBeenCalledWith([
        { $match: { url: expect.any(Object) } },
        { $group: { _id: '$referralSource', totalCount: { $sum: 1 } } },
        { $project: { referralSource: '$_id', totalCount: 1, _id: 0 } },
      ]);
      expect(result).toEqual(mockReferralSourceData);
    });
  });

  describe('fetchUrlDevicesData', () => {
    it('should fetch device type data for a given URL', async () => {
      const urlId = mockAnalytics.url;
      const mockDeviceTypeData = [{ deviceType: 'Mobile', totalCount: 1 }];

      jest
        .spyOn(analyticModel, 'aggregate')
        .mockResolvedValueOnce(mockDeviceTypeData);

      const result = await urlRepository.fetchUrlDevicesData(urlId);

      expect(analyticModel.aggregate).toHaveBeenCalledWith([
        { $match: { url: expect.any(Object) } },
        { $group: { _id: '$deviceType', totalCount: { $sum: 1 } } },
        { $project: { deviceType: '$_id', totalCount: 1, _id: 0 } },
      ]);
      expect(result).toEqual(mockDeviceTypeData);
    });
  });

  describe('getPeakHoursForUrl', () => {
    it('should fetch peak hour data for a given URL', async () => {
      const urlId = mockAnalytics.url;
      const mockPeakHourData = [
        { _id: { hour: 12, date: '2024-03-18' }, hitCount: 10 },
        { _id: { hour: 14, date: '2024-03-18' }, hitCount: 8 },
      ];
      const expectedPeakHoursByDate = {
        '2024-03-18': { hour: '12 PM', hitCount: 10 },
      };

      jest
        .spyOn(analyticModel, 'aggregate')
        .mockResolvedValueOnce(mockPeakHourData);

      const result = await urlRepository.getPeakHoursForUrl(urlId);

      expect(analyticModel.aggregate).toHaveBeenCalledWith([
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
      expect(result).toEqual(expectedPeakHoursByDate);
    });
  });
});
