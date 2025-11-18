import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubmitAnswerDto } from '../common/dto/submit-answer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('tests')
@UseGuards(JwtAuthGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('daily')
  async getDailyTest(@CurrentUser() user: any) {
    return this.testsService.getDailyTest(user.userId);
  }

  @Post(':id/start')
  async startTest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.testsService.startTest(id, user.userId);
  }

  @Post(':id/answer')
  async submitAnswer(
    @Param('id') id: string,
    @Body() answerDto: SubmitAnswerDto,
    @CurrentUser() user: any,
  ) {
    return this.testsService.submitAnswer(id, user.userId, answerDto);
  }

  @Post(':id/complete')
  async completeTest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.testsService.completeTest(id, user.userId);
  }

  @Get('history')
  async getHistory(@CurrentUser() user: any, @Query() query: PaginationDto) {
    return this.testsService.getHistory(user.userId, query);
  }
}

