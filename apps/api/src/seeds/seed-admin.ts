import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';

export async function runSeedAdmin(app: INestApplicationContext): Promise<void> {
  const usersService = app.get(UsersService);
  try {
    const existingAdmin = await usersService.findByEmail('admin@eventzi.com');
    if (existingAdmin) {
      console.log('✅ Admin already exists');
      return;
    }
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await usersService.create({
      email: 'admin@eventzi.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'HAKARI',
      role: UserRole.ADMIN,
    });
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@eventzi.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: ADMIN');
    console.log('⚠️  Please change the password after first login!');
  } catch (error: unknown) {
    console.error('❌ Error seeding admin:', error instanceof Error ? error.message : String(error));
  }
}

/** Standalone seed script: creates its own app context, runs seed, then closes. */
export async function seedAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    await runSeedAdmin(app);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  seedAdmin();
}
