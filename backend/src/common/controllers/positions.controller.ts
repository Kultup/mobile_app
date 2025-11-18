import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Position } from '../schemas/position.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreatePositionDto } from '../dto/create-position.dto';
import { Public } from '../decorators/public.decorator';

@Controller('positions')
export class PositionsController {
  constructor(@InjectModel(Position.name) private positionModel: Model<Position>) {}

  @Get()
  @Public()
  async findAll(@Query('include_inactive') includeInactive?: string) {
    const filter: any = {};
    if (includeInactive !== 'true') {
      filter.is_active = true;
    }
    const positions = await this.positionModel.find(filter).sort({ name: 1 }).exec();
    return { data: positions };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async create(@Body() createDto: CreatePositionDto) {
    const position = new this.positionModel(createDto);
    return position.save();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreatePositionDto>) {
    return this.positionModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async remove(@Param('id') id: string) {
    await this.positionModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).exec();
    return { message: 'Position deactivated successfully' };
  }
}

