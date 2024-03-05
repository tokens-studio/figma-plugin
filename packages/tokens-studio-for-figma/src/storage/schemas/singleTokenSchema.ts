import z from 'zod';

export const singleTokenSchema = z.object({
  value: z.any(),
  type: z.string(),
  description: z.string().optional(),
}).passthrough();
