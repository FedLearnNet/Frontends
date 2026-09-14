

export interface LogPage<L> {
  pageSize: number;
  page: number;
  totalCount: number;
  results: L[];
}
