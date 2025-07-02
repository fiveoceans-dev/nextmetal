
import { z } from 'zod';

export const apiErrorSchema = z.object({
  message: z.string(),
  status: z.number().optional(),
  code: z.string().optional(),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  data: dataSchema.optional(),
  error: apiErrorSchema.optional(),
  success: z.boolean(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
  success: boolean;
};
export type PaginationData = z.infer<typeof paginationSchema>;
