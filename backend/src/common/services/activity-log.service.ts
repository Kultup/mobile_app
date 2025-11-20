import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminActivityLog } from '../schemas/admin-activity-log.schema';

export interface CreateActivityLogDto {
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(AdminActivityLog.name) private adminActivityLogModel: Model<AdminActivityLog>,
  ) {}

  async createLog(logData: CreateActivityLogDto): Promise<AdminActivityLog> {
    try {
      const log = new this.adminActivityLogModel(logData);
      const savedLog = await log.save();
      console.log('[ActivityLogService] Log created:', {
        _id: savedLog._id,
        action: savedLog.action,
        entity_type: savedLog.entity_type,
        admin_user_id: savedLog.admin_user_id,
      });
      return savedLog;
    } catch (error) {
      console.error('[ActivityLogService] Error creating log:', error);
      throw error;
    }
  }

  async createLogAsync(logData: CreateActivityLogDto): Promise<void> {
    // Асинхронне створення логу без очікування результату
    this.createLog(logData).catch((error) => {
      console.error('[ActivityLogService] Error in async log creation:', error);
    });
  }
}

