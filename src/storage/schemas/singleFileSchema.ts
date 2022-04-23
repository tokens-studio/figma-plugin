import z from 'zod';

export const singleFileSchema = z.object({
  values: z.record(z.record(z.object({
    value: z.any(),
    type: z.string(),
  }))),
  $themes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    selectedTokenSets: z.record(z.string()),
    $figmaStyleReferences: z.record(z.number()).optional(),
  })).optional(),
});
