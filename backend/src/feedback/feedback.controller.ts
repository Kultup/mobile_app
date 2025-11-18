import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SuggestQuestionDto } from '../common/dto/suggest-question.dto';
import { ReportErrorDto } from '../common/dto/report-error.dto';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('question')
  async suggestQuestion(@Body() dto: SuggestQuestionDto, @CurrentUser() user: any) {
    return this.feedbackService.suggestQuestion(user.userId, dto);
  }

  @Post('report-error')
  async reportError(@Body() dto: ReportErrorDto, @CurrentUser() user: any) {
    return this.feedbackService.reportError(user.userId, dto);
  }
}

