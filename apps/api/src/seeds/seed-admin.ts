import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';

export async function runSeedAdmin(
  app: INestApplicationContext,
): Promise<void> {
  try {
    // Use User model directly to check existence (including password field)
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const adminEmail = 'admin@eventzi.com';
    const adminPassword = 'Admin@123';

    // Check if admin exists (without excluding password field)
    const existingAdmin = await userModel.findOne({ email: adminEmail }).exec();

    if (existingAdmin) {
      console.log('✅ Admin already exists');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('👤 Role: ADMIN');
      // Verify password is correct (in case it was changed manually)
      const isPasswordValid = await bcrypt.compare(
        adminPassword,
        existingAdmin.password,
      );
      if (isPasswordValid) {
        console.log('🔑 Default password is still valid: Admin@123');
      } else {
        console.log('⚠️  Password has been changed from default');
      }
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await userModel.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'HAKARI',
      role: UserRole.ADMIN,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('👤 Role: ADMIN');
    console.log(`🆔 User ID: ${adminUser._id}`);
    console.log('⚠️  Please change the password after first login!');
  } catch (error: unknown) {
    console.error(
      '❌ Error seeding admin:',
      error instanceof Error ? error.message : String(error),
    );
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

/** Standalone seed script: creates its own app context, runs seed, then closes. */
export async function seedAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    await runSeedAdmin(app);
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
