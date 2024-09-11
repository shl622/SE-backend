import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe()
  )
  app.enableCors({
    origin: 'https://studio.apollographql.com',
    methods: 'GET',
    allowedHeaders: 'Content-Type,Accept'
  })
  await app.listen(4000);
}
bootstrap();
