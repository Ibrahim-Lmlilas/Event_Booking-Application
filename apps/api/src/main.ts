import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedAdmin } from './seeds/seed-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT!;
  
  await seedAdmin();
  
  await app.listen(port);
  console.log(`🚀 Backend API running on : http://localhost:${port}/api`);
}
bootstrap();
