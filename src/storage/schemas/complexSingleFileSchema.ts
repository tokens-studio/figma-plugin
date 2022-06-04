import z from 'zod';
import { themeObjectSchema } from './themeObjectSchema';
import { tokensMapSchema } from './tokensMapSchema';
import type { DeepTokensMap, ThemeObjectsList } from '@/types';

// @README this schema applies to Git type providers

interface ComplexSingleFileFormat {
  [K: string]: ThemeObjectsList | DeepTokensMap<false>
}

export const complexSingleFileSchema: z.ZodType<ComplexSingleFileFormat> = z.lazy(() => (
  (z.record(tokensMapSchema.or(z.array(themeObjectSchema))) as z.ZodType<ComplexSingleFileFormat>)
));
