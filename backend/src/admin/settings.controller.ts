import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() body: { value: string; description?: string },
    @CurrentUser() user: any,
  ) {
    return this.settingsService.updateSetting(key, body.value, body.description, user.userId);
  }

  @Post()
  async createSetting(
    @Body() body: { key: string; value: string; description?: string },
    @CurrentUser() user: any,
  ) {
    return this.settingsService.createSetting(body.key, body.value, body.description, user.userId);
  }

  @Delete(':key')
  @Roles('super_admin')
  async deleteSetting(@Param('key') key: string) {
    await this.settingsService.deleteSetting(key);
    return { message: 'Setting deleted successfully' };
  }
}

