import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger/winston.logger';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './admin/schemas/admin-user.schema';

// Import compression using require for compatibility
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'http://localhost:*', 'https:'],
        mediaSrc: ["'self'", 'blob:', 'http://localhost:*', 'https:'],
      },
    },
  }));
  app.use(compression());

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGIN')?.split(',') || [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true, // Якщо не вказано, дозволяємо всім
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters and interceptors
  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kraina Mriy API')
    .setDescription('API для системи навчання персоналу ресторанної мережі "Країна Мрій"')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Create default admin user if it doesn't exist
  await createDefaultAdmin(app, configService);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

async function createDefaultAdmin(app: any, configService: ConfigService) {
  try {
    const adminEmail = configService.get<string>('ADMIN_EMAIL');
    const adminPassword = configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      console.log('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env, skipping default admin creation');
      return;
    }

    const adminUserModel = app.get(getModelToken(AdminUser.name)) as Model<AdminUser>;

    // Check if any admin exists
    const existingAdmin = await adminUserModel.findOne().exec();

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create default admin
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const username = adminEmail.split('@')[0] || 'admin';
    
    const defaultAdmin = new adminUserModel({
      username: username,
      email: adminEmail,
      password_hash: passwordHash,
      role: 'super_admin',
      is_active: true,
    });

    await defaultAdmin.save();
    console.log(`✅ Default admin user created:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   You can login with either email or username`);
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}

bootstrap();

