import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminExportService } from './admin-export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateAdminUserDto } from '../common/dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../common/dto/update-admin-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin', 'viewer')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminExportService: AdminExportService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @Roles('super_admin', 'training_admin', 'viewer')
  async getUsers(@Query() query: PaginationDto & { city_id?: string; position_id?: string; is_active?: boolean; search?: string }) {
    return this.adminService.getUsers(query);
  }

  @Put('users/:id')
  @Roles('super_admin', 'training_admin')
  async updateUser(@Param('id') id: string, @Body() updateDto: any) {
    return this.adminService.updateUser(id, updateDto);
  }

  @Delete('users/:id')
  @Roles('super_admin')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('admin-users')
  @Roles('super_admin')
  async getAdminUsers(@Query() query: PaginationDto) {
    return this.adminService.getAdminUsers(query);
  }

  @Post('admin-users')
  @Roles('super_admin')
  async createAdminUser(@Body() createDto: CreateAdminUserDto) {
    return this.adminService.createAdminUser(createDto);
  }

  @Put('admin-users/:id')
  @Roles('super_admin')
  async updateAdminUser(@Param('id') id: string, @Body() updateDto: UpdateAdminUserDto) {
    return this.adminService.updateAdminUser(id, updateDto);
  }

  @Delete('admin-users/:id')
  @Roles('super_admin')
  async deleteAdminUser(@Param('id') id: string) {
    return this.adminService.deleteAdminUser(id);
  }

  @Get('statistics/export')
  @Roles('super_admin', 'training_admin')
  async exportStatistics(@Res() res: Response) {
    const buffer = await this.adminExportService.exportStatisticsToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=statistics_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get('tests/export')
  @Roles('super_admin', 'training_admin')
  async exportTestHistory(@Query('user_id') userId: string | undefined, @Res() res: Response) {
    const buffer = await this.adminExportService.exportTestHistoryToExcel(userId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=test_history_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }
}

