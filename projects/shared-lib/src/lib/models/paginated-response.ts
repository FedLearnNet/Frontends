export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  results: T[];
}
