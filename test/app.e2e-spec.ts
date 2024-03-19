import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import mongoose from 'mongoose';

describe('End-to-End Tests', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(() => {
    mongoose.connect(process.env.MONGODB_URL).then(function () {
      mongoose.connection.db.dropCollection('users');
      mongoose.connection.db.dropCollection('urls');
      mongoose.connection.db.dropCollection('analytics');
    });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  const mockSignUpData = {
    email: 'newuser@example.com',
    name: 'New User',
    password: 'newuserpassword',
  };

  const mockSignInData = {
    email: 'newuser@example.com',
    password: 'newuserpassword',
  };

  let authToken: string;

  describe('User Authentication', () => {
    it('should sign up a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/sign-up')
        .send(mockSignUpData)
        .expect(HttpStatus.CREATED);

      expect(response.body.message).toEqual('successfully signed up');
    });

    it('should sign in an existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/sign-in')
        .send(mockSignInData)
        .expect(HttpStatus.CREATED);

      expect(response.body.message).toEqual('Successfully signed in');
      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });
  });

  describe('URL Functionality', () => {
    // TODO: will be finishing soon
    // let shortenedUrl: string;
    // it('should shorten a URL', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/url/shorten')
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .send({ url: 'https://example.com' })
    //     .expect(HttpStatus.CREATED);
    //   expect(response.body.shortUrl).toBeDefined();
    //   shortenedUrl = response.body.shortUrl;
    // });
    // it('should request a shortened URL', async () => {
    //   await request(app.getHttpServer())
    //     .get(shortenedUrl)
    //     .expect(HttpStatus.MOVED_PERMANENTLY);
    // });
    // it('should fetch user URLs', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/url/user-urls')
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .expect(HttpStatus.OK);
    //   expect(response.body.urls).toBeDefined();
    // });
    // it('should return URL analytics data', async () => {
    //   const shortenResponse = await request(app.getHttpServer())
    //     .post('/url/shorten')
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .send({ url: 'https://example.com' })
    //     .expect(HttpStatus.CREATED);
    //   const urlId = shortenResponse.body.shortUrl.split('/').pop();
    //   // Now, request analytics for this URL
    //   const response = await request(app.getHttpServer())
    //     .get(`/url/url-analytics/${urlId}`)
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .expect(HttpStatus.OK);
    //   expect(response.body.analytics).toBeDefined();
    // });
  });
});
