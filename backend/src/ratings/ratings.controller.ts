import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('global')
  async getGlobalRating(@Query() query: any) {
    return this.ratingsService.getGlobalRating(query);
  }

  @Get('by-city')
  async getByCity(@Query() query: any) {
    return this.ratingsService.getByCity(query);
  }

  @Get('by-position')
  async getByPosition(@Query() query: any) {
    return this.ratingsService.getByPosition(query);
  }
}

