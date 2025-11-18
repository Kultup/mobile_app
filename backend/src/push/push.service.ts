import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PushToken } from './schemas/push-token.schema';

@Injectable()
export class PushService {
  constructor(
    @InjectModel(PushToken.name) private pushTokenModel: Model<PushToken>,
  ) {}

  async registerToken(userId: string, tokenDto: { token: string; platform: string }) {
    // Перевірити чи вже існує
    const existing = await this.pushTokenModel.findOne({
      token: tokenDto.token,
    }).exec();

    if (existing) {
      // Оновити user_id якщо змінився
      if (existing.user_id.toString() !== userId) {
        existing.user_id = userId as any;
        existing.last_used_at = new Date();
        await existing.save();
      }
      return { message: 'Token updated' };
    }

    // Створити новий
    const pushToken = new this.pushTokenModel({
      user_id: userId,
      token: tokenDto.token,
      platform: tokenDto.platform,
      last_used_at: new Date(),
    });

    await pushToken.save();
    return { message: 'Token registered successfully' };
  }

  async removeToken(userId: string, token: string) {
    await this.pushTokenModel.deleteOne({
      user_id: userId,
      token: token,
    }).exec();

    return { message: 'Token removed successfully' };
  }

  async sendNotification(userId: string, notification: { title: string; body: string; data?: any }) {
    const tokens = await this.pushTokenModel.find({
      user_id: userId,
      is_active: true,
    }).exec();

    if (tokens.length === 0) {
      return { sent: 0, message: 'No active tokens found' };
    }

    // TODO: Implement Firebase FCM integration
    // const admin = require('firebase-admin');
    // const messages = tokens.map(token => ({
    //   token: token.token,
    //   notification: {
    //     title: notification.title,
    //     body: notification.body,
    //   },
    //   data: notification.data || {},
    // }));
    // await admin.messaging().sendAll(messages);

    // Поки що просто логуємо
    console.log(`Sending notification to user ${userId}: ${notification.title} - ${notification.body}`);

    return {
      sent: tokens.length,
      message: 'Notifications queued (Firebase FCM integration pending)',
    };
  }
}

