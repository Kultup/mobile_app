import api from './api';

export interface ProductType {
  _id: string;
  name: string;
  label: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductTypeDto {
  name: string;
  label: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateProductTypeDto {
  label?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export const productTypesService = {
  getAll: async (is_active?: boolean): Promise<ProductType[]> => {
    const params: any = {};
    if (is_active !== undefined) {
      params.is_active = is_active;
    }
    const { data } = await api.get('/admin/shop/product-types', { params });
    return data;
  },

  getById: async (id: string): Promise<ProductType> => {
    const { data } = await api.get(`/admin/shop/product-types/${id}`);
    return data;
  },

  create: async (productType: CreateProductTypeDto): Promise<ProductType> => {
    const { data } = await api.post('/admin/shop/product-types', productType);
    return data;
  },

  update: async (id: string, productType: UpdateProductTypeDto): Promise<ProductType> => {
    const { data } = await api.put(`/admin/shop/product-types/${id}`, productType);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/shop/product-types/${id}`);
  },
};

