import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res, Inject, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { SurveysService } from './surveys.service';
import { AdminExportService } from '../admin/admin-export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateSurveyDto } from '../common/dto/create-survey.dto';

@Controller('admin/surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class SurveysAdminController {
  constructor(
    private readonly surveysService: SurveysService,
    @Inject(forwardRef(() => AdminExportService))
    private readonly adminExportService: AdminExportService,
  ) {}

  @Get()
  async getSurveys(@Query() query: PaginationDto & { is_active?: boolean }) {
    return this.surveysService.getSurveysForAdmin(query);
  }

  @Get(':id')
  async getSurvey(@Param('id') id: string) {
    return this.surveysService.getSurveyForAdmin(id);
  }

  @Post()
  async createSurvey(@Body() createDto: CreateSurveyDto) {
    return this.surveysService.createSurvey(createDto);
  }

  @Put(':id')
  async updateSurvey(@Param('id') id: string, @Body() updateDto: Partial<CreateSurveyDto>) {
    return this.surveysService.updateSurvey(id, updateDto);
  }

  @Delete(':id')
  async deleteSurvey(@Param('id') id: string) {
    return this.surveysService.deleteSurvey(id);
  }

  @Get(':id/responses')
  async getResponses(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.surveysService.getResponses(id, query);
  }

  @Get(':id/responses/export')
  async exportResponses(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.adminExportService.exportSurveyResponsesToExcel(id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=survey_responses_${id}_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }
}
