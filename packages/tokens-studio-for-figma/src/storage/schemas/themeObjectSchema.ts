import z from 'zod';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export const themeObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.string().optional(),
  selectedTokenSets: z.record(z.enum([
    TokenSetStatus.ENABLED,
    TokenSetStatus.DISABLED,
    TokenSetStatus.SOURCE,
  ])),
  $figmaStyleReferences: z.record(z.string()).optional(),
  $figmaVariableReferences: z.record(z.string()).optional(),
  $figmaCollectionId: z.string().optional(),
  $figmaModeId: z.string().optional(),
  // Extended collection metadata
  $figmaIsExtension: z.boolean().optional(),
  $figmaParentCollectionId: z.string().optional(),
  $figmaParentThemeId: z.string().optional(),
  $figmaMirrorParentSets: z.boolean().optional(),
});
