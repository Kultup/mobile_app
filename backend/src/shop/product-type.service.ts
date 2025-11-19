import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductType } from './schemas/product-type.schema';
import { CreateProductTypeDto, UpdateProductTypeDto } from '../common/dto/create-product-type.dto';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectModel(ProductType.name) private productTypeModel: Model<ProductType>,
  ) {}

  async findAll(is_active?: boolean) {
    const filter: any = {};
    if (is_active !== undefined) {
      filter.is_active = is_active;
    }
    return this.productTypeModel
      .find(filter)
      .sort({ sort_order: 1, created_at: -1 })
      .exec();
  }

  async findOne(id: string) {
    const productType = await this.productTypeModel.findById(id).exec();
    if (!productType) {
      throw new NotFoundException('Product type not found');
    }
    return productType;
  }

  async findByName(name: string) {
    return this.productTypeModel.findOne({ name }).exec();
  }

  async create(createDto: CreateProductTypeDto) {
    // Перевірка на унікальність name
    const existing = await this.findByName(createDto.name);
    if (existing) {
      throw new BadRequestException(`Product type with name "${createDto.name}" already exists`);
    }

    const productType = new this.productTypeModel(createDto);
    return productType.save();
  }

  async update(id: string, updateDto: UpdateProductTypeDto) {
    const productType = await this.productTypeModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    ).exec();

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    return productType;
  }

  async remove(id: string) {
    const productType = await this.productTypeModel.findByIdAndDelete(id).exec();
    if (!productType) {
      throw new NotFoundException('Product type not found');
    }
    return { message: 'Product type deleted successfully' };
  }
}

