import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from '../schemas/city.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreateCityDto } from '../dto/create-city.dto';
import { Public } from '../decorators/public.decorator';

@Controller('cities')
export class CitiesController {
  constructor(@InjectModel(City.name) private cityModel: Model<City>) {}

  @Get()
  @Public()
  async findAll(@Query('include_inactive') includeInactive?: string) {
    const filter: any = {};
    if (includeInactive !== 'true') {
      filter.is_active = true;
    }
    const cities = await this.cityModel.find(filter).sort({ name: 1 }).exec();
    return { data: cities };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async create(@Body() createDto: CreateCityDto) {
    const city = new this.cityModel(createDto);
    return city.save();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateCityDto>) {
    return this.cityModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async remove(@Param('id') id: string) {
    await this.cityModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).exec();
    return { message: 'City deactivated successfully' };
  }
}

