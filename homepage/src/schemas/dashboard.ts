
import { z } from 'zod';

export const statisticsSchema = z.object({
  totalUsers: z.number().int().positive(),
  activeUsers: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  growth: z.number(),
  timestamp: z.string().datetime(),
});

export const tokenomicsSchema = z.object({
  label: z.string(),
  value: z.string(),
  percent: z.number().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

export const userActivitySchema = z.object({
  userId: z.string(),
  action: z.enum(['login', 'logout', 'view', 'click', 'purchase']),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export type StatisticsData = z.infer<typeof statisticsSchema>;
export type TokenomicsItem = z.infer<typeof tokenomicsSchema>;
export type UserActivity = z.infer<typeof userActivitySchema>;
