export type Nullish<T> = T | null | undefined;

export interface AsyncState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  fetched: boolean;
}

export interface PaginatedState<T> {
  loading: boolean;
  error: string | null;
  data: T[] | null;
  fetched: boolean;
  cursor: string | null;
}
