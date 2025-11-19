import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopProductCategory } from '../shop/schemas/shop-product-category.schema';
import { ShopProduct } from '../shop/schemas/shop-product.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Controller('admin/shop/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class ShopCategoriesAdminController {
  constructor(
    @InjectModel(ShopProductCategory.name) private categoryModel: Model<ShopProductCategory>,
    @InjectModel(ShopProduct.name) private productModel: Model<ShopProduct>,
  ) {}

  @Get()
  async getAll() {
    const categories = await this.categoryModel.find().sort({ sort_order: 1, name: 1 }).exec();
    return { data: categories };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Post()
  async create(@Body() createDto: { name: string; parent_id?: string; sort_order?: number; is_active?: boolean }) {
    const category = new this.categoryModel(createDto);
    return category.save();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { name?: string; parent_id?: string; sort_order?: number; is_active?: boolean },
  ) {
    const category = await this.categoryModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Перевірити чи використовується категорія
    const productsCount = await this.productModel.countDocuments({ category: id }).exec();
    if (productsCount > 0) {
      throw new BadRequestException(`Cannot delete category: it is used by ${productsCount} product(s)`);
    }

    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}

