import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SurveyResponseDto } from '../common/dto/survey-response.dto';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  async getSurveys(@CurrentUser() user: any) {
    return this.surveysService.getSurveys(user.userId);
  }

  @Post(':id/respond')
  async respond(@Param('id') id: string, @Body() responseDto: SurveyResponseDto, @CurrentUser() user: any) {
    return this.surveysService.respond(id, user.userId, responseDto);
  }
}

