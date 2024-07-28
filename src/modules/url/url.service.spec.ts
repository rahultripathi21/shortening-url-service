import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';

import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';
import { HelperService } from '../helper/helper.service';
import { RedisService } from '../helper/redis.service';

describe('UrlService', () => {
  let urlService: UrlService;
  let urlRepository: UrlRepository;
  let helperService: HelperService;
  let configService: ConfigService;
  let redisService: RedisService;
  const urlHashKey = process.env.URL_HASH_KEY;

  const mockUrlRepository = {
    findUrl: jest.fn(),
    addUrlData: jest.fn(),
    updateUrlData: jest.fn(),
    createAnalytics: jest.fn(),
    fetchUrlReferrersData: jest.fn(),
    fetchUrlBrowserData: jest.fn(),
    fetchUrlDevicesData: jest.fn(),
    getPeakHoursForUrl: jest.fn(),
    findUrls: jest.fn(),
    deleteUrls: jest.fn(),
    deleteAnalytics: jest.fn(),
  };

  const mockHelperService = {
    generateShortCode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRedisService = {
    setDataInRedis: jest.fn(),
    getDataFromRedis: jest.fn(),
    deleteDataFromRedis: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: UrlRepository,
          useValue: mockUrlRepository,
        },
        {
          provide: HelperService,
          useValue: mockHelperService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    urlService = module.get<UrlService>(UrlService);
    urlRepository = module.get<UrlRepository>(UrlRepository);
    helperService = module.get<HelperService>(HelperService);
    configService = module.get<ConfigService>(ConfigService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(urlService).toBeDefined();
  });

  describe('shortenUrl', () => {
    const url = 'http://example.com';
    const user = '61c0ccf11d7bf83d153d7c06';
    const urlCode = 'abc123';
    const shortURL = `http://short.url/link/${urlCode}`;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully shorten URL if it does not exist', async () => {
      jest.spyOn(urlRepository, 'findUrl').mockResolvedValueOnce(null);
      jest
        .spyOn(helperService, 'generateShortCode')
        .mockReturnValueOnce(urlCode);
      jest.spyOn(configService, 'get').mockReturnValueOnce('http://short.url/');
      jest
        .spyOn(urlRepository, 'addUrlData')
        .mockReturnValueOnce(mockUrl as any);

      const urlDataToAdd = {
        originalURL: url,
        shortURL,
        urlCode,
        user,
      };

      await urlService.shortenUrl(url, user);

      expect(urlRepository.findUrl).toHaveBeenCalledWith({
        originalURL: url,
        user: new mongoose.Types.ObjectId(user),
      });
      expect(helperService.generateShortCode).toHaveBeenCalled();
      expect(urlRepository.addUrlData).toHaveBeenCalledWith(urlDataToAdd);
    });

    it('should return shortened URL if it already exists', async () => {
      const urlExist = { urlCode: 'abc123' };
      const user = '61c0ccf11d7bf83d153d7c06';
      jest
        .spyOn(urlRepository, 'findUrl')
        .mockResolvedValueOnce(urlExist as any);
      jest.spyOn(configService, 'get').mockReturnValueOnce('http://short.url/');

      const result = await urlService.shortenUrl(url, user);

      expect(urlRepository.findUrl).toHaveBeenCalledWith({
        originalURL: url,
        user: new mongoose.Types.ObjectId(user),
      });
      expect(result).toEqual({ shortUrl: shortURL });
    });
  });

  describe('requestUrl', () => {
    const urlCode = 'abc123';
    const referralSource = 'referrer';
    const browserType = 'chrome';
    const deviceType = 'desktop';
    const redisUrlData = {
      url: 'http://example.com',
      urlId: '61c0ccf11d7bf83d153d7c06',
    };
    const expectedRedirectUrl = redisUrlData.url;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully request URL if it exists in Redis', async () => {
      jest
        .spyOn(redisService, 'getDataFromRedis')
        .mockResolvedValueOnce(JSON.stringify(redisUrlData));

      const result = await urlService.requestUrl({
        urlCode,
        referralSource,
        browserType,
        deviceType,
      });

      expect(redisService.getDataFromRedis).toHaveBeenCalledWith(
        urlHashKey,
        urlCode,
      );
      expect(urlRepository.updateUrlData).toHaveBeenCalledWith(
        { _id: redisUrlData.urlId },
        { $inc: { clickCount: 1 }, lastClickedAt: expect.any(Number) },
      );
      expect(urlRepository.createAnalytics).toHaveBeenCalledWith({
        referralSource,
        browserType,
        deviceType,
        url: redisUrlData.urlId,
      });
      expect(result).toEqual({ redirectUrl: expectedRedirectUrl });
    });

    it('should successfully request URL if it exists in database', async () => {
      jest.spyOn(redisService, 'getDataFromRedis').mockResolvedValueOnce(null);

      const urlExist = {
        _id: '61c0ccf11d7bf83d153d7c06',
        originalURL: 'http://example.com',
      };
      jest
        .spyOn(urlRepository, 'findUrl')
        .mockResolvedValueOnce(urlExist as any);

      const result = await urlService.requestUrl({
        urlCode,
        referralSource,
        browserType,
        deviceType,
      });

      expect(redisService.getDataFromRedis).toHaveBeenCalledWith(
        urlHashKey,
        urlCode,
      );
      expect(urlRepository.findUrl).toHaveBeenCalledWith({ urlCode });
      expect(redisService.setDataInRedis).toHaveBeenCalledWith(
        urlHashKey,
        urlCode,
        JSON.stringify({
          urlId: urlExist._id.toString(),
          url: urlExist.originalURL,
        }),
      );
      expect(urlRepository.updateUrlData).toHaveBeenCalledWith(
        { _id: urlExist._id },
        { $inc: { clickCount: 1 }, lastClickedAt: expect.any(Number) },
      );

      expect(urlRepository.createAnalytics).toHaveBeenCalledWith({
        referralSource,
        browserType,
        deviceType,
        url: urlExist._id,
      });
      expect(result).toEqual({ redirectUrl: expectedRedirectUrl });
    });

    it('should throw NotFoundException if URL does not exist', async () => {
      jest.spyOn(redisService, 'getDataFromRedis').mockResolvedValueOnce(null);

      jest.spyOn(urlRepository, 'findUrl').mockResolvedValueOnce(null);

      await expect(
        urlService.requestUrl({
          urlCode,
          referralSource,
          browserType,
          deviceType,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(redisService.getDataFromRedis).toHaveBeenCalledWith(
        urlHashKey,
        urlCode,
      );
      expect(urlRepository.findUrl).toHaveBeenCalledWith({ urlCode });
      expect(redisService.setDataInRedis).not.toHaveBeenCalled();
      expect(urlRepository.updateUrlData).not.toHaveBeenCalled();
      expect(urlRepository.createAnalytics).not.toHaveBeenCalled();
    });
  });

  describe('fetchUserUrls', () => {
    const user = '61c0ccf11d7bf83d153d7c06';
    const mockUrls = [
      { _id: '61c0ccf11d7bf83d153d7c06', originalURL: 'http://example.com' },
    ];

    it('should successfully fetch user URLs', async () => {
      jest
        .spyOn(urlRepository, 'findUrls')
        .mockResolvedValueOnce(mockUrls as any);

      const result = await urlService.fetchUserUrls(user);

      expect(urlRepository.findUrls).toHaveBeenCalledWith({
        user: expect.any(mongoose.Types.ObjectId),
      });
      expect(result).toEqual({ urls: mockUrls });
    });

    it('should return empty array if user has no URLs', async () => {
      jest.spyOn(urlRepository, 'findUrls').mockResolvedValueOnce(null);

      const result = await urlService.fetchUserUrls(user);

      expect(urlRepository.findUrls).toHaveBeenCalledWith({
        user: expect.any(mongoose.Types.ObjectId),
      });
      expect(result).toEqual({ urls: [] });
    });
  });

  describe('urlAnalytics', () => {
    const url = '61c0ccf11d7bf83d153d7c06';
    const user = '61c0ccf11d7bf83d153d7c06';
    const mockUrlExist = {
      _id: '61c0ccf11d7bf83d153d7c06',
      user: '61c0ccf11d7bf83d153d7c06',
      clickCount: 10,
    };
    const mockReferrersData = [
      { referralSource: 'referrer1', totalCount: 5 },
      { referralSource: 'referrer2', totalCount: 10 },
    ];

    const mockBrowsersData = [
      { browserName: 'chrome', totalCount: 15 },
      { browserName: 'firefox', totalCount: 20 },
    ];

    const mockDevicesData = [
      { deviceType: 'desktop', totalCount: 25 },
      { deviceType: 'mobile', totalCount: 30 },
    ];

    const mockPeakHours = [
      { hour: '9am', hitCount: 35 },
      { hour: '12pm', hitCount: 40 },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully retrieve URL analytics', async () => {
      jest
        .spyOn(mockUrlRepository, 'findUrl')
        .mockResolvedValueOnce(mockUrlExist);
      jest
        .spyOn(mockUrlRepository, 'fetchUrlReferrersData')
        .mockResolvedValueOnce(mockReferrersData);
      jest
        .spyOn(mockUrlRepository, 'fetchUrlBrowserData')
        .mockResolvedValueOnce(mockBrowsersData);
      jest
        .spyOn(mockUrlRepository, 'fetchUrlDevicesData')
        .mockResolvedValueOnce(mockDevicesData);
      jest
        .spyOn(mockUrlRepository, 'getPeakHoursForUrl')
        .mockResolvedValueOnce(mockPeakHours);

      const result = await urlService.urlAnalytics(url, user);

      expect(urlRepository.findUrl).toHaveBeenCalledWith({
        _id: expect.any(mongoose.Types.ObjectId),
      });
      expect(urlRepository.fetchUrlReferrersData).toHaveBeenCalledWith(url);
      expect(urlRepository.fetchUrlBrowserData).toHaveBeenCalledWith(url);
      expect(urlRepository.fetchUrlDevicesData).toHaveBeenCalledWith(url);
      expect(urlRepository.getPeakHoursForUrl).toHaveBeenCalledWith(url);
      expect(result).toEqual({
        analytics: {
          clickCount: mockUrlExist.clickCount,
          referrersData: mockReferrersData,
          browsersData: mockBrowsersData,
          devicesData: mockDevicesData,
          peakHours: mockPeakHours,
        },
      });
    });

    it('should throw NotFoundException if URL does not exist', async () => {
      jest.spyOn(urlRepository, 'findUrl').mockResolvedValueOnce(null);

      await expect(urlService.urlAnalytics(url, user)).rejects.toThrow(
        NotFoundException,
      );

      expect(urlRepository.findUrl).toHaveBeenCalledWith({
        _id: expect.any(mongoose.Types.ObjectId),
      });
      expect(urlRepository.fetchUrlReferrersData).not.toHaveBeenCalled();
      expect(urlRepository.fetchUrlBrowserData).not.toHaveBeenCalled();
      expect(urlRepository.fetchUrlDevicesData).not.toHaveBeenCalled();
      expect(urlRepository.getPeakHoursForUrl).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user does not match URL user', async () => {
      const invalidUrlExist = {
        ...mockUrlExist,
        user: new mongoose.Types.ObjectId(),
      };
      jest
        .spyOn(mockUrlRepository, 'findUrl')
        .mockResolvedValueOnce(invalidUrlExist);

      await expect(urlService.urlAnalytics(url, user)).rejects.toThrow(
        BadRequestException,
      );

      expect(urlRepository.findUrl).toHaveBeenCalledWith({
        _id: expect.any(mongoose.Types.ObjectId),
      });
      expect(urlRepository.fetchUrlReferrersData).not.toHaveBeenCalled();
      expect(urlRepository.fetchUrlBrowserData).not.toHaveBeenCalled();
      expect(urlRepository.fetchUrlDevicesData).not.toHaveBeenCalled();
      expect(urlRepository.getPeakHoursForUrl).not.toHaveBeenCalled();
    });
  });
});
