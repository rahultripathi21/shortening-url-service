import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerMiddleware(app: INestApplication) {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .addOAuth2()
    .setTitle('URL Shortener Service')
    .setDescription('Backend api documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'documentation',
    },
  });
}
