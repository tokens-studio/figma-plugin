import z from 'zod';
import { tokensMapSchema } from './tokensMapSchema';
import { themeObjectSchema } from './themeObjectSchema';

export const multiFileSchema = tokensMapSchema.or(z.array(themeObjectSchema)).or(z.object({
  tokenSetOrder: z.array(z.string()).optional(),
}));
