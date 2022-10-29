import z from 'zod';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokensMapSchema } from './tokensMapSchema';

export const multiFileSchema = tokensMapSchema.or(z.array(z.object({
  id: z.string(),
  name: z.string(),
  selectedTokenSets: z.record(z.enum([
    TokenSetStatus.ENABLED,
    TokenSetStatus.DISABLED,
    TokenSetStatus.SOURCE,
  ])),
  $figmaStyleReferences: z.record(z.string()).optional(),
}))).or(z.object({
  tokenSetOrder: z.array(z.string()).optional(),
}));
