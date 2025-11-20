import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from '../users/schemas/user.schema';
import { AdminUser } from '../admin/schemas/admin-user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ActivityLogService } from '../common/services/activity-log.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => ActivityLogService))
    private activityLogService?: ActivityLogService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Перевірити чи не існує користувач
    const existing = await this.userModel.findOne({
      full_name: registerDto.full_name,
      city_id: registerDto.city_id,
      position_id: registerDto.position_id,
    }).exec();

    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const user = new this.userModel(registerDto);
    await user.save();

    const payload = { sub: user._id.toString(), username: user.full_name, role: 'user', type: 'user' };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id,
        full_name: user.full_name,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    // Для мобільних користувачів логін за ПІБ (без пароля)
    const user = await this.userModel.findOne({
      full_name: loginDto.username,
    }).populate('city_id', 'name').populate('position_id', 'name').exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id.toString(), username: user.full_name, role: 'user', type: 'user' };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id,
        full_name: user.full_name,
        city: user.city_id,
        position: user.position_id,
      },
      token,
    };
  }

  async adminLogin(loginDto: LoginDto) {
    // Allow login by username or email
    const admin = await this.adminUserModel.findOne({
      $or: [
        { username: loginDto.username },
        { email: loginDto.username },
      ],
      is_active: true,
    }).exec();

    if (!admin) {
      // Log for debugging
      const allAdmins = await this.adminUserModel.find().exec();
      console.log(`[Auth] Login attempt failed. Looking for: ${loginDto.username}`);
      console.log(`[Auth] Found ${allAdmins.length} admin(s) in database:`);
      allAdmins.forEach((a) => {
        console.log(`[Auth]   - Username: "${a.username}", Email: "${a.email}", Active: ${a.is_active}`);
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password_hash);
    if (!isPasswordValid) {
      console.log(`[Auth] Password mismatch for admin: ${admin.username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Оновити last_login_at
    admin.last_login_at = new Date();
    await admin.save();

    // Логування входу адміністратора
    if (this.activityLogService) {
      this.activityLogService.createLogAsync({
        admin_user_id: admin._id.toString(),
        action: 'login',
        entity_type: 'admin_user',
        description: `Вхід адміністратора: ${admin.username}`,
      }).catch((err) => {
        console.error('[AuthService] Error logging admin login:', err);
      });
    }

    const payload = { sub: admin._id.toString(), username: admin.username, role: admin.role, type: 'admin' };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  }

  async getProfile(user: any) {
    if (user.type === 'admin') {
      const admin = await this.adminUserModel.findById(user.userId).exec();
      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      };
    } else {
      const userDoc = await this.userModel.findById(user.userId)
        .populate('city_id', 'name')
        .populate('position_id', 'name')
        .exec();
      return userDoc;
    }
  }

  async createFirstAdmin(loginDto: LoginDto) {
    // Check if any admin exists
    const existingAdmin = await this.adminUserModel.findOne().exec();
    if (existingAdmin) {
      throw new UnauthorizedException('Admin user already exists. Use admin/login endpoint.');
    }

    // Create first admin
    const passwordHash = await bcrypt.hash(loginDto.password, 10);
    const adminEmail = loginDto.username.includes('@') ? loginDto.username : `${loginDto.username}@kraina-mriy.com`;
    const username = loginDto.username.includes('@') ? loginDto.username.split('@')[0] : loginDto.username;

    const admin = new this.adminUserModel({
      username: username,
      email: adminEmail,
      password_hash: passwordHash,
      role: 'super_admin',
      is_active: true,
    });

    await admin.save();

    const payload = { sub: admin._id.toString(), username: admin.username, role: admin.role, type: 'admin' };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token,
      message: 'First admin user created successfully',
    };
  }

  async refreshToken(user: any) {
    const payload = { sub: user.userId, username: user.username, role: user.role, type: user.type };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async logout(user: any) {
    // Логування виходу адміністратора
    if (user.type === 'admin' && this.activityLogService) {
      this.activityLogService.createLogAsync({
        admin_user_id: user.userId,
        action: 'logout',
        entity_type: 'admin_user',
        description: `Вихід адміністратора: ${user.username}`,
      }).catch((err) => {
        console.error('[AuthService] Error logging admin logout:', err);
      });
    }
    return { message: 'Logged out successfully' };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ full_name: username }).exec();
    if (user) {
      return { userId: user._id.toString(), username: user.full_name, role: 'user', type: 'user' };
    }
    return null;
  }

  async validateAdminUser(username: string, password: string): Promise<any> {
    const admin = await this.adminUserModel.findOne({ username, is_active: true }).exec();
    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      if (isPasswordValid) {
        return { userId: admin._id.toString(), username: admin.username, role: admin.role, type: 'admin' };
      }
    }
    return null;
  }
}

