import z from 'zod';
import { themeObjectSchema } from './themeObjectSchema';
import { tokensMapSchema } from './tokensMapSchema';
import type { DeepTokensMap, ThemeObjectsList } from '@/types';

// @README this schema applies to Git type providers

type ReservedFields = {
  $themes?: ThemeObjectsList
  $metadata?: {
    tokenSetOrder?: string[]
  }
};

type ComplexSingleFileFormat = ReservedFields & {
  [K in Exclude<string, '$metadata' | '$themes'>]: DeepTokensMap<false>
};

export const complexSingleFileSchema: z.ZodType<ComplexSingleFileFormat> = z.lazy(() => (
  (z.record(tokensMapSchema.or(z.array(themeObjectSchema)).or(z.object({
    tokenSetOrder: z.array(z.string()).optional(),
  }))) as z.ZodType<ComplexSingleFileFormat>)
));
