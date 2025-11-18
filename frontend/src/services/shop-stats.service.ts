import api from './api';

export interface ProductStatistics {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  statistics: {
    total_purchases: number;
    total_revenue: number;
    applied_purchases: number;
    not_applied_purchases: number;
  };
  purchases: {
    data: Array<{
      user: {
        id: string;
        full_name: string;
        city?: { _id: string; name: string };
        position?: { _id: string; name: string };
      };
      price_paid: number;
      is_applied: boolean;
      purchased_at: string;
      applied_at?: string;
    }>;
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface PopularProduct {
  product_id: string;
  product_name: string;
  product_type: string;
  purchase_count: number;
  total_revenue: number;
}

export const shopStatsService = {
  getStatistics: async (productId: string, params?: { page?: number; per_page?: number }): Promise<ProductStatistics> => {
    const { data } = await api.get(`/admin/shop/products/${productId}/statistics`, { params });
    return data;
  },

  getPopularProducts: async (limit?: number): Promise<{ data: PopularProduct[] }> => {
    const { data } = await api.get('/admin/shop/products/statistics/popular', { params: { limit } });
    return data;
  },
};

