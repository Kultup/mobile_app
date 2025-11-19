/**
 * Скрипт для скидання пароля адміністратора
 * Використання: npx ts-node scripts/reset-admin-password.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../src/admin/schemas/admin-user.schema';
import { ConfigService } from '@nestjs/config';

async function resetAdminPassword() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const adminUserModel = app.get(getModelToken(AdminUser.name)) as Model<AdminUser>;

  const adminEmail = configService.get<string>('ADMIN_EMAIL') || 'admin@kraina-mriy.com';
  const adminPassword = configService.get<string>('ADMIN_PASSWORD') || 'admin123';

  try {
    // Знайти адміністратора
    const admin = await adminUserModel.findOne({
      $or: [{ email: adminEmail }, { username: adminEmail.split('@')[0] }],
    }).exec();

    if (!admin) {
      console.log('❌ Admin user not found');
      console.log(`   Searching for: ${adminEmail}`);
      const allAdmins = await adminUserModel.find().exec();
      console.log(`   Found ${allAdmins.length} admin(s) in database:`);
      allAdmins.forEach((a) => {
        console.log(`   - Username: ${a.username}, Email: ${a.email}`);
      });
      await app.close();
      return;
    }

    // Оновити пароль
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin.password_hash = passwordHash;
    admin.is_active = true;
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   New Password: ${adminPassword}`);
    console.log(`   You can login with either username or email`);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await app.close();
  }
}

resetAdminPassword();

