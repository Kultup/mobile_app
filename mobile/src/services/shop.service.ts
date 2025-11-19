import api from './api';
import type {ShopProduct, UserPurchase, PurchaseResponse} from '../types';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const shopService = {
  /**
   * Get products
   */
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    product_type?: string;
    category?: string;
  }): Promise<PaginatedResponse<ShopProduct>> {
    const response = await api.get<PaginatedResponse<ShopProduct>>(
      '/shop/products',
      {params},
    );
    return response.data;
  },

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<ShopProduct> {
    const response = await api.get<{data: ShopProduct}>(`/shop/products/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Purchase product
   */
  async purchase(productId: string): Promise<PurchaseResponse> {
    const response = await api.post<PurchaseResponse>('/shop/purchase', {
      product_id: productId,
    });
    return response.data;
  },

  /**
   * Apply product (avatar, theme, etc.)
   */
  async applyProduct(purchaseId: string): Promise<{message: string}> {
    const response = await api.post<{message: string}>('/shop/apply-product', {
      purchase_id: purchaseId,
    });
    return response.data;
  },

  /**
   * Get purchase history
   */
  async getPurchases(
    page = 1,
    perPage = 20,
  ): Promise<PaginatedResponse<UserPurchase>> {
    const response = await api.get<PaginatedResponse<UserPurchase>>(
      '/shop/purchases',
      {
        params: {page, per_page: perPage},
      },
    );
    return response.data;
  },

  /**
   * Get user balance
   */
  async getBalance(): Promise<{balance: number}> {
    const response = await api.get<{balance: number}>('/user/balance');
    return response.data;
  },
};

