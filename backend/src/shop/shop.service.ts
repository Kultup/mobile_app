import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopProduct } from './schemas/shop-product.schema';
import { UserPurchase } from './schemas/user-purchase.schema';
import { User } from '../users/schemas/user.schema';
import { PointsTransaction } from './schemas/points-transaction.schema';
import { PurchaseProductDto } from '../common/dto/purchase-product.dto';
import { ApplyProductDto } from '../common/dto/apply-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(ShopProduct.name) private shopProductModel: Model<ShopProduct>,
    @InjectModel(UserPurchase.name) private userPurchaseModel: Model<UserPurchase>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PointsTransaction.name) private pointsTransactionModel: Model<PointsTransaction>,
  ) {}

  async getProducts(query: PaginationDto & { product_type?: string; category?: string }) {
    const { page = 1, per_page = 20, product_type, category } = query;
    const skip = (page - 1) * per_page;

    const filter: any = { is_active: true };
    if (product_type) filter.product_type = product_type;
    if (category) filter.category = category;

    const [data, total] = await Promise.all([
      this.shopProductModel.find(filter).skip(skip).limit(per_page).sort({ sort_order: 1 }).exec(),
      this.shopProductModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async getProduct(id: string) {
    const product = await this.shopProductModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async purchase(userId: string, purchaseDto: PurchaseProductDto) {
    const product = await this.shopProductModel.findById(purchaseDto.product_id).exec();
    if (!product || !product.is_active) {
      throw new NotFoundException('Product not found or not available');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.points_balance < product.price) {
      throw new BadRequestException('Insufficient balance');
    }

    // Перевірка чи вже куплено
    const existingPurchase = await this.userPurchaseModel.findOne({
      user_id: userId,
      product_id: purchaseDto.product_id,
    }).exec();

    if (existingPurchase) {
      throw new BadRequestException('Product already purchased');
    }

    // Створення покупки
    const purchase = new this.userPurchaseModel({
      user_id: userId,
      product_id: purchaseDto.product_id,
      price_paid: product.price,
      purchased_at: new Date(),
    });
    await purchase.save();

    // Списання балів
    const newBalance = user.points_balance - product.price;
    await this.userModel.findByIdAndUpdate(userId, { points_balance: newBalance }).exec();

    // Транзакція
    await this.pointsTransactionModel.create({
      user_id: userId,
      transaction_type: 'spent',
      amount: -product.price,
      source: 'purchase',
      source_id: purchase._id,
      description: `Purchase: ${product.name}`,
      balance_after: newBalance,
    });

    return {
      purchase_id: purchase._id,
      product: {
        id: product._id,
        name: product.name,
      },
      price_paid: product.price,
      balance_after: newBalance,
      message: 'Товар успішно придбано!',
    };
  }

  async applyProduct(userId: string, applyDto: ApplyProductDto) {
    const purchase = await this.userPurchaseModel
      .findById(applyDto.purchase_id)
      .populate('product_id')
      .exec();

    if (!purchase || purchase.user_id.toString() !== userId) {
      throw new NotFoundException('Purchase not found');
    }

    const product = purchase.product_id as any;

    // Застосування товару залежно від типу
    const updateData: any = {};
    if (product.product_type === 'avatar') {
      updateData.avatar_id = product._id;
    } else if (product.product_type === 'profile_frame') {
      updateData.profile_frame_id = product._id;
    } else if (product.product_type === 'badge') {
      // Додати до active_badges
      const user = await this.userModel.findById(userId).exec();
      if (!user.active_badges.includes(product._id)) {
        updateData.active_badges = [...user.active_badges, product._id];
      }
    }

    await this.userModel.findByIdAndUpdate(userId, updateData).exec();
    await this.userPurchaseModel.findByIdAndUpdate(applyDto.purchase_id, {
      is_applied: true,
      applied_at: new Date(),
    }).exec();

    return { message: 'Товар успішно застосовано!' };
  }

  async getPurchases(userId: string, query: PaginationDto) {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const [data, total] = await Promise.all([
      this.userPurchaseModel
        .find({ user_id: userId })
        .populate('product_id', 'name product_type image_url')
        .skip(skip)
        .limit(per_page)
        .sort({ purchased_at: -1 })
        .exec(),
      this.userPurchaseModel.countDocuments({ user_id: userId }),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }
}

