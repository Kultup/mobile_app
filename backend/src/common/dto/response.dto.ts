export class ApiResponseDto<T> {
  statusCode: number;
  data: T;
  message?: string;
  timestamp: string;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

