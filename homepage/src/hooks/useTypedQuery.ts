
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '@/types';

export function useTypedQuery<TData, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<ApiResponse<TData>>,
  schema: z.ZodSchema<TData>,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      
      if (response.success && response.data) {
        const validationResult = schema.safeParse(response.data);
        if (!validationResult.success) {
          throw new Error(`Data validation failed: ${validationResult.error.message}`);
        }
        return {
          ...response,
          data: validationResult.data,
        };
      }
      
      return response;
    },
    ...options,
  });
}

export function useTypedMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  schema: z.ZodSchema<TData>
) {
  return {
    mutate: async (variables: TVariables) => {
      const response = await mutationFn(variables);
      
      if (response.success && response.data) {
        const validationResult = schema.safeParse(response.data);
        if (!validationResult.success) {
          throw new Error(`Data validation failed: ${validationResult.error.message}`);
        }
        return {
          ...response,
          data: validationResult.data,
        };
      }
      
      return response;
    },
  };
}
