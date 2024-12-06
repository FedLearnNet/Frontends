

export interface LogPage<L> {
  count: number;
  next: string | null;
  previous: string | null;
  results: L[];
}
