import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { UrlController } from './url.controller';
import { UrlService } from './url.service';

import { UserRepository } from '../user/user.repository';
import { ShortenUrlDTO } from './url.dto';

const mockUserModel = {};

describe('UrlController', () => {
  let urlController: UrlController;
  let urlService: UrlService;

  const mockUrlService = {
    shortenUrl: jest.fn(),
    requestUrl: jest.fn(),
    fetchUserUrls: jest.fn(),
    urlAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UrlController],
      providers: [
        ConfigService,
        UserRepository,
        { provide: UrlService, useValue: mockUrlService },
        { provide: 'UserModel', useValue: mockUserModel },
      ],
    }).compile();

    urlService = module.get<UrlService>(UrlService);
    urlController = module.get<UrlController>(UrlController);
  });

  it('should be defined', () => {
    expect(urlController).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should call shortenUrl service method', async () => {
      const dto: ShortenUrlDTO = { url: 'http://example.com' };
      const user = { _id: 'someUserId' };
      const urlCode = 'abc123';
      const shortURL = `http://short.url/link/${urlCode}`;

      const urlServiceSpy = jest
        .spyOn(urlService, 'shortenUrl')
        .mockResolvedValueOnce({ shortUrl: shortURL });

      await urlController.shortenUrl(dto, user);

      expect(urlServiceSpy).toHaveBeenCalledWith(dto.url, user._id);
    });
  });

  describe('requestUrl', () => {
    it('should call requestUrl service method and redirect', async () => {
      const urlCode = 'someUrlCode';
      const request: Request = {
        headers: { 'user-agent': 'Test User Agent' },
      } as Request;
      const response: Response = {
        redirect: jest.fn(),
      } as unknown as Response;

      const mockRedirectUrl = 'http://redirect.com';
      const mockServiceResponse = { redirectUrl: mockRedirectUrl };

      jest
        .spyOn(urlService, 'requestUrl')
        .mockResolvedValue(mockServiceResponse);

      await urlController.requestUrl(urlCode, request, response);

      expect(urlService.requestUrl).toHaveBeenCalledWith({
        urlCode: urlCode,
        referralSource: undefined,
        browserType: 'unknown',
        deviceType: 'Unknown',
      });

      expect(response.redirect).toHaveBeenCalledWith(mockRedirectUrl);
    });
  });

  describe('fetchUserUrls', () => {
    it('should call fetchUserUrls service method', async () => {
      const user = { _id: 'someUserId' };
      await urlController.fetchUserUrls(user);
      expect(urlService.fetchUserUrls).toHaveBeenCalledWith(user._id);
    });
  });

  describe('urlAnalytics', () => {
    it('should call urlAnalytics service method', async () => {
      const urlId = 'someUrlId';
      const user = { _id: 'someUserId' };
      const analyticsData = {
        analytics: {
          clickCount: 1000,
          referrersData: [
            { referralSource: 'Google', totalCount: 500 },
            { referralSource: 'Direct', totalCount: 300 },
            { referralSource: 'Facebook', totalCount: 200 },
          ],
          browsersData: [
            { browserName: 'Chrome', totalCount: 600 },
            { browserName: 'Firefox', totalCount: 300 },
            { browserName: 'Safari', totalCount: 100 },
          ],
          devicesData: [
            { deviceType: 'Desktop', totalCount: 700 },
            { deviceType: 'Mobile', totalCount: 250 },
            { deviceType: 'Tablet', totalCount: 50 },
          ],
          peakHours: {
            '2024-03-19': { hour: '10 AM', hitCount: 200 },
            '2024-03-20': { hour: '11 AM', hitCount: 300 },
            '2024-03-21': { hour: '12 PM', hitCount: 500 },
          },
        },
      };

      jest
        .spyOn(urlService, 'urlAnalytics')
        .mockResolvedValueOnce(analyticsData);

      const result = await urlController.urlAnalytics(urlId, user);

      expect(urlService.urlAnalytics).toHaveBeenCalledWith(urlId, user._id);
      expect(result).toEqual(analyticsData);
    });
  });
});
