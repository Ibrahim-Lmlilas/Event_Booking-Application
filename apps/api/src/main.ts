import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedAdmin } from './seeds/seed-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT!;
  
  await seedAdmin();
  
  await app.listen(port);
  console.log(`🚀 Backend API running on : http://localhost:${port}`);
}
bootstrap();
