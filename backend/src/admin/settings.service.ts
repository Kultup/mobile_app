import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSettings } from '../common/schemas/system-settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SystemSettings.name) private settingsModel: Model<SystemSettings>,
  ) {}

  async getSetting(key: string): Promise<SystemSettings> {
    const setting = await this.settingsModel.findOne({ key }).exec();
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return setting;
  }

  async getAllSettings(): Promise<SystemSettings[]> {
    return this.settingsModel.find().exec();
  }

  async updateSetting(key: string, value: string, description?: string, updatedBy?: string): Promise<SystemSettings> {
    const setting = await this.settingsModel.findOneAndUpdate(
      { key },
      {
        value,
        description,
        updated_by: updatedBy,
      },
      { upsert: true, new: true },
    ).exec();

    return setting;
  }

  async createSetting(key: string, value: string, description?: string, updatedBy?: string): Promise<SystemSettings> {
    const setting = new this.settingsModel({
      key,
      value,
      description,
      updated_by: updatedBy,
    });
    return setting.save();
  }

  async deleteSetting(key: string): Promise<void> {
    const result = await this.settingsModel.deleteOne({ key }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
  }
}

