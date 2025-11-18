import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PurchaseProductDto } from '../common/dto/purchase-product.dto';
import { ApplyProductDto } from '../common/dto/apply-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  async getProducts(@Query() query: PaginationDto & { product_type?: string; category?: string }) {
    return this.shopService.getProducts(query);
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.shopService.getProduct(id);
  }

  @Post('purchase')
  async purchase(@Body() purchaseDto: PurchaseProductDto, @CurrentUser() user: any) {
    return this.shopService.purchase(user.userId, purchaseDto);
  }

  @Post('apply-product')
  async applyProduct(@Body() applyDto: ApplyProductDto, @CurrentUser() user: any) {
    return this.shopService.applyProduct(user.userId, applyDto);
  }

  @Get('purchases')
  async getPurchases(@CurrentUser() user: any, @Query() query: PaginationDto) {
    return this.shopService.getPurchases(user.userId, query);
  }
}

