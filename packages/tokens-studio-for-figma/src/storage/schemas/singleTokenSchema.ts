import z from 'zod';

const baseSchema = z.object({
  value: z.any(),
  type: z.string(),
  description: z.string().optional(),
}).passthrough();

const dollarPrefixedSchema = z.object({
  $value: z.any(),
  $type: z.string(),
  $description: z.string().optional(),
}).passthrough();

export const singleTokenSchema = z.union([baseSchema, dollarPrefixedSchema]);