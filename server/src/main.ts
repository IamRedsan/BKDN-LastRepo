import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import {
  APP_CONFIG,
  CORS_CONFIG,
  COOKIE_CONFIG,
} from './common/constant/register-name.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable cookie parser
  const cookieConfig = configService.get(COOKIE_CONFIG);
  app.use(cookieParser(cookieConfig));

  // Enable CORS
  const corsConfig = configService.get<CorsOptions>(CORS_CONFIG);
  app.enableCors(corsConfig);

  // Get app config
  const appConfig = configService.get(APP_CONFIG);
  const { port } = appConfig;

  // Start server
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
