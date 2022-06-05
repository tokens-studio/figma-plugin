import z from 'zod';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { singleTokenSchema } from './singleTokenSchema';

export const multiFileSchema = z.record(singleTokenSchema).or(z.array(z.object({
  id: z.string(),
  name: z.string(),
  selectedTokenSets: z.record(z.enum([
    TokenSetStatus.ENABLED,
    TokenSetStatus.DISABLED,
    TokenSetStatus.SOURCE,
  ])),
  $figmaStyleReferences: z.record(z.string()).optional(),
})));
