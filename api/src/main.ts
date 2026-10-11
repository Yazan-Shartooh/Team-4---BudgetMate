import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // Do not enable implicit conversion: a JSON string such as "12" must not
      // silently become the number 12 for a money amount.
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`BudgetMate API is running at http://localhost:${port}/api`);
}

void bootstrap();
