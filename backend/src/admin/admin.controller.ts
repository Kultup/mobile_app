import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminExportService } from './admin-export.service';
import { ActivityLogService } from '../common/services/activity-log.service';
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
    private readonly activityLogService: ActivityLogService,
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
  async updateUser(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return this.adminService.updateUser(id, updateDto, user.userId);
  }

  @Delete('users/:id')
  @Roles('super_admin')
  async deleteUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.deleteUser(id, user.userId);
  }

  @Get('admin-users')
  @Roles('super_admin')
  async getAdminUsers(@Query() query: PaginationDto) {
    return this.adminService.getAdminUsers(query);
  }

  @Post('admin-users')
  @Roles('super_admin')
  async createAdminUser(@Body() createDto: CreateAdminUserDto, @CurrentUser() user: any) {
    return this.adminService.createAdminUser(createDto, user.userId);
  }

  @Put('admin-users/:id')
  @Roles('super_admin')
  async updateAdminUser(@Param('id') id: string, @Body() updateDto: UpdateAdminUserDto, @CurrentUser() user: any) {
    return this.adminService.updateAdminUser(id, updateDto, user.userId);
  }

  @Delete('admin-users/:id')
  @Roles('super_admin')
  async deleteAdminUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.deleteAdminUser(id, user.userId);
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

  @Get('feedback/questions')
  @Roles('super_admin', 'training_admin', 'viewer')
  async getFeedbackQuestions(@Query() query: PaginationDto & { is_reviewed?: boolean }) {
    return this.adminService.getFeedbackQuestions(query);
  }

  @Get('feedback/error-reports')
  @Roles('super_admin', 'training_admin', 'viewer')
  async getFeedbackErrorReports(@Query() query: PaginationDto & { is_reviewed?: boolean }) {
    return this.adminService.getFeedbackErrorReports(query);
  }

  @Put('feedback/questions/:id/review')
  @Roles('super_admin', 'training_admin')
  async markFeedbackQuestionReviewed(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.markFeedbackQuestionReviewed(id, user.userId);
  }

  @Put('feedback/error-reports/:id/review')
  @Roles('super_admin', 'training_admin')
  async markErrorReportReviewed(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.markErrorReportReviewed(id, user.userId);
  }

  @Get('activity-logs')
  @Roles('super_admin', 'training_admin', 'viewer')
  async getActivityLogs(@Query() query: PaginationDto & { admin_user_id?: string; action_type?: string; entity_type?: string; start_date?: string; end_date?: string }) {
    console.log('[AdminController] getActivityLogs request:', query);
    const result = await this.adminService.getActivityLogs(query);
    console.log('[AdminController] getActivityLogs response:', {
      total: result.meta.total,
      dataLength: result.data.length,
    });
    return result;
  }

  @Get('users/:id/details')
  @Roles('super_admin', 'training_admin', 'viewer')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }
}

