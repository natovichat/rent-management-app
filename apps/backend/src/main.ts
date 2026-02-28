import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Remove technology fingerprinting header
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Swagger only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Rent Application API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://rent-management-app.vercel.app',
        'https://rent-management-app-frontend.vercel.app',
      ];

      // Allow any Vercel preview deployment
      if (!origin || allowedOrigins.includes(origin) || origin.match(/\.vercel\.app$/)) {
        callback(null, true);
      } else {
        // Return false (not an Error) to avoid unhandled 500 — Express will send proper CORS rejection
        callback(null, false);
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}

bootstrap();
