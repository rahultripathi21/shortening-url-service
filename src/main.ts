import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as xss from 'xss-clean';
import * as compression from 'compression';
import * as hpp from 'hpp';
import * as cors from 'cors';

import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { swaggerMiddleware } from './shared/swagger';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.PRECONDITION_FAILED,
      transform: true,
    }),
  );
  app.use(cors());
  app.use(compression());
  app.use(xss());
  app.use(hpp());
  swaggerMiddleware(app);

  await app.listen(port, () => {
    Logger.log(`Server is running on port ${port} `);
  });
}
bootstrap();
