import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { runSeedAdmin } from './seeds/seed-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Event Booking API')
    .setDescription(
      'API for event management, reservations, and user management',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS - supports multiple origins separated by comma
  const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const corsOrigins = corsOriginRaw.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:3000'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;

  await runSeedAdmin(app);

  await app.listen(port);
  console.log(`🚀 Backend API running on : http://localhost:${port}/api`);
  console.log(`📚 Swagger docs : http://localhost:${port}/api/docs`);
}
bootstrap();
