import z from 'zod';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export const themeObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  selectedTokenSets: z.record(z.enum([
    TokenSetStatus.ENABLED,
    TokenSetStatus.DISABLED,
    TokenSetStatus.SOURCE,
  ])),
  $figmaStyleReferences: z.record(z.string()).optional(),
});
