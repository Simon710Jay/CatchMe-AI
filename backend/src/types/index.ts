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

export type LogInput = z.infer<typeof LogSchema>;

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
