import api from './api';

export interface ShopProduct {
  _id: string;
  name: string;
  description: string;
  product_type: 'avatar' | 'profile_frame' | 'badge' | 'theme' | 'customization' | 'gift';
  price: number;
  image_url: string;
  preview_url?: string;
  is_active: boolean;
  is_premium: boolean;
  category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateShopProductDto {
  name: string;
  description: string;
  product_type: string; // Дозволяємо будь-який тип товару
  price: number;
  image_url: string;
  preview_url?: string;
  is_active?: boolean;
  is_premium?: boolean;
  category?: string;
  sort_order?: number;
  custom_product_type?: string; // Для форми, коли вибрано "custom"
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const shopService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    product_type?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<ShopProduct>> => {
    const { data } = await api.get('/admin/shop/products', { params });
    return data;
  },

  getById: async (id: string): Promise<ShopProduct> => {
    const { data } = await api.get(`/admin/shop/products/${id}`);
    return data;
  },

  create: async (product: CreateShopProductDto): Promise<ShopProduct> => {
    const { data } = await api.post('/admin/shop/products', product);
    return data;
  },

  update: async (id: string, product: Partial<CreateShopProductDto>): Promise<ShopProduct> => {
    const { data } = await api.put(`/admin/shop/products/${id}`, product);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/shop/products/${id}`);
  },
};

