import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from '../common/dto/update-profile.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateDto);
  }

  @Get('statistics')
  async getStatistics(@CurrentUser() user: any) {
    return this.usersService.getStatistics(user.userId);
  }

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    return this.usersService.getBalance(user.userId);
  }
}

