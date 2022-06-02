import z from 'zod';
import { tokensMapSchema } from './tokensMapSchema';
import { themeObjectSchema } from './themeObjectSchema';

// @README this schema only applies to URL and JSONBIN

export const singleFileSchema = z.object({
  values: z.record(tokensMapSchema),
  $themes: z.array(themeObjectSchema).optional(),
});
