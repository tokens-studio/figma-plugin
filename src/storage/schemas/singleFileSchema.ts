import z from 'zod';
import { tokensMapSchema } from './tokensMapSchema';

export const singleFileSchema = z.object({
  values: z.record(tokensMapSchema),
  $themes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    selectedTokenSets: z.record(z.string()),
    $figmaStyleReferences: z.record(z.string()).optional(),
  })).optional(),
});
