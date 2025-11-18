export interface User {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'training_admin' | 'viewer';
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

