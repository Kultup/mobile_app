import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductTypeService } from '../shop/product-type.service';
import { CreateProductTypeDto, UpdateProductTypeDto } from '../common/dto/create-product-type.dto';

@Controller('admin/shop/product-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class ProductTypesAdminController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Get()
  async getAll(@Query('is_active') is_active?: string) {
    const isActive = is_active === 'true' ? true : is_active === 'false' ? false : undefined;
    return this.productTypeService.findAll(isActive);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.productTypeService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateProductTypeDto) {
    return this.productTypeService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductTypeDto) {
    return this.productTypeService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productTypeService.remove(id);
  }
}

