import z from 'zod';

export const multiFileSchema = z.record(z.record(z.object({
  value: z.any(),
  type: z.string(),
}))).or(z.array(z.object({
  id: z.string(),
  name: z.string(),
  selectedTokenSets: z.record(z.string()),
  $figmaStyleReferences: z.record(z.number()).optional(),
})));
