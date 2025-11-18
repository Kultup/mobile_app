import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterTokenDto } from '../common/dto/register-token.dto';

@Controller('push-tokens')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post()
  async registerToken(@Body() tokenDto: RegisterTokenDto, @CurrentUser() user: any) {
    return this.pushService.registerToken(user.userId, tokenDto);
  }

  @Delete(':token')
  async removeToken(@Param('token') token: string, @CurrentUser() user: any) {
    return this.pushService.removeToken(user.userId, token);
  }
}

