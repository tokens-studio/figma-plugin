import z from 'zod';
import { singleTokenSchema } from './singleTokenSchema';
import { themeObjectSchema } from './themeObjectSchema';
import type { SingleToken } from '@/types/tokens';
import type { ThemeObjectsList } from '@/types';

// @README this schema applies to Git type providers

interface ComplexSingleFileFormat {
  [K: string]: SingleToken<false> | ThemeObjectsList
}

export const complexSingleFileSchema: z.ZodType<ComplexSingleFileFormat> = z.lazy(() => (
  (z.record(z.record(singleTokenSchema).or(z.array(themeObjectSchema).optional())) as z.ZodType<ComplexSingleFileFormat>)
));
