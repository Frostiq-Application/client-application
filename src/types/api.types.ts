/** Generic API envelope shapes shared across the service-application. */

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Normalized error surfaced by the axios layer (see lib/apiError.ts). */
export interface NormalizedError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
