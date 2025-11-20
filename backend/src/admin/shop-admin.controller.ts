import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { ShopProduct } from '../shop/schemas/shop-product.schema';
import { UserPurchase } from '../shop/schemas/user-purchase.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateShopProductDto } from '../common/dto/create-shop-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';
import { ActivityLogService } from '../common/services/activity-log.service';

@Controller('admin/shop/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class ShopAdminController {
  constructor(
    @InjectModel(ShopProduct.name) private shopProductModel: Model<ShopProduct>,
    @InjectModel(UserPurchase.name) private userPurchaseModel: Model<UserPurchase>,
    private activityLogService: ActivityLogService,
  ) {}

  @Get()
  async getAll(@Query() query: PaginationDto & { product_type?: string; category?: string; is_active?: boolean }) {
    const { page = 1, per_page = 20, product_type, category, is_active } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (product_type) filter.product_type = product_type;
    if (category) filter.category = category;
    if (is_active !== undefined) filter.is_active = is_active;

    const [data, total] = await Promise.all([
      this.shopProductModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .sort({ sort_order: 1, created_at: -1 })
        .exec(),
      this.shopProductModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const product = await this.shopProductModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Post()
  async create(@Body() createDto: CreateShopProductDto, @CurrentUser() user: any, @Req() req: Request) {
    const product = await this.shopProductModel.create(createDto);
    
    // Логування створення товару
    this.activityLogService.createLogAsync({
      admin_user_id: user.userId,
      action: 'create',
      entity_type: 'shop_product',
      entity_id: product._id.toString(),
      description: `Створено товар: ${product.name}`,
      ip_address: req.ip || (req.headers['x-forwarded-for'] as string) || '',
      user_agent: req.headers['user-agent'] || '',
    }).catch((err) => {
      console.error('[ShopAdminController] Error logging product creation:', err);
    });
    
    return product;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateShopProductDto>, @CurrentUser() user: any, @Req() req: Request) {
    const product = await this.shopProductModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    // Логування оновлення товару
    this.activityLogService.createLogAsync({
      admin_user_id: user.userId,
      action: 'update',
      entity_type: 'shop_product',
      entity_id: id,
      description: `Оновлено товар: ${product.name}`,
      ip_address: req.ip || (req.headers['x-forwarded-for'] as string) || '',
      user_agent: req.headers['user-agent'] || '',
    }).catch((err) => {
      console.error('[ShopAdminController] Error logging product update:', err);
    });
    
    return product;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any, @Req() req: Request) {
    const product = await this.shopProductModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    const productName = product.name;
    await this.shopProductModel.findByIdAndDelete(id).exec();
    
    // Логування видалення товару
    this.activityLogService.createLogAsync({
      admin_user_id: user.userId,
      action: 'delete',
      entity_type: 'shop_product',
      entity_id: id,
      description: `Видалено товар: ${productName}`,
      ip_address: req.ip || (req.headers['x-forwarded-for'] as string) || '',
      user_agent: req.headers['user-agent'] || '',
    }).catch((err) => {
      console.error('[ShopAdminController] Error logging product deletion:', err);
    });
    
    return { message: 'Product deleted successfully' };
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string, @Query() query: PaginationDto) {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const product = await this.shopProductModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Загальна статистика
    const totalPurchases = await this.userPurchaseModel.countDocuments({ product_id: id }).exec();
    const totalRevenue = await this.userPurchaseModel.aggregate([
      { $match: { product_id: id } },
      { $group: { _id: null, total: { $sum: '$price_paid' } } },
    ]);
    const appliedPurchases = await this.userPurchaseModel.countDocuments({
      product_id: id,
      is_applied: true,
    }).exec();

    // Список покупок
    const [purchases, total] = await Promise.all([
      this.userPurchaseModel
        .find({ product_id: id })
        .populate('user_id', 'full_name city_id position_id')
        .skip(skip)
        .limit(per_page)
        .sort({ purchased_at: -1 })
        .exec(),
      this.userPurchaseModel.countDocuments({ product_id: id }),
    ]);

    return {
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
      },
      statistics: {
        total_purchases: totalPurchases,
        total_revenue: totalRevenue[0]?.total || 0,
        applied_purchases: appliedPurchases,
        not_applied_purchases: totalPurchases - appliedPurchases,
      },
      purchases: {
        data: purchases.map((p) => ({
          user: {
            id: p.user_id['_id'],
            full_name: p.user_id['full_name'],
            city: p.user_id['city_id'],
            position: p.user_id['position_id'],
          },
          price_paid: p.price_paid,
          is_applied: p.is_applied,
          purchased_at: p.purchased_at,
          applied_at: p.applied_at,
        })),
        meta: Helpers.generatePaginationMeta(page, per_page, total),
      },
    };
  }

  @Get('statistics/popular')
  async getPopularProducts(@Query() query: { limit?: number }) {
    const { limit = 10 } = query;

    const popularProducts = await this.userPurchaseModel.aggregate([
      {
        $group: {
          _id: '$product_id',
          purchase_count: { $sum: 1 },
          total_revenue: { $sum: '$price_paid' },
        },
      },
      { $sort: { purchase_count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'shopproducts',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          product_id: '$_id',
          product_name: '$product.name',
          product_type: '$product.product_type',
          purchase_count: 1,
          total_revenue: 1,
        },
      },
    ]);

    return {
      data: popularProducts,
    };
  }
}

