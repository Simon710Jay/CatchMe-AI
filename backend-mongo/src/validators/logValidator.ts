import { z } from 'zod';

export const LogSchema = z.object({
  message: z.string(),
  service: z.string(),
  severity: z.enum(['critical', 'warning', 'info', 'resolved']),
  timestamp: z.string().optional(),
  stackTrace: z.string().optional(),
  endpoint: z.string().optional(),
  statusCode: z.number().optional(),
});
