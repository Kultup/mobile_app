import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async getAchievements(@CurrentUser() user: any) {
    return this.achievementsService.getAchievements(user.userId);
  }

  @Get('all')
  async getAllAchievements(@CurrentUser() user: any) {
    return this.achievementsService.getAllAchievements(user.userId);
  }
}

