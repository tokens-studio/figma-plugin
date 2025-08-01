import z from 'zod';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

// Base effect schema with common properties
const baseEffectSchema = z.object({
  type: z.nativeEnum(BoxShadowTypes),
  blendMode: z.string().optional(),
});

// Shadow effect schema (for DROP_SHADOW and INNER_SHADOW)
const shadowEffectSchema = baseEffectSchema.extend({
  type: z.enum([BoxShadowTypes.DROP_SHADOW, BoxShadowTypes.INNER_SHADOW]),
  color: z.string(),
  x: z.union([z.string(), z.number()]),
  y: z.union([z.string(), z.number()]),
  blur: z.union([z.string(), z.number()]),
  spread: z.union([z.string(), z.number()]),
}).strict();

// Glass effect schema (for GLASS effect, which maps to BACKGROUND_BLUR)
const glassEffectSchema = baseEffectSchema.extend({
  type: z.literal(BoxShadowTypes.GLASS),
  blur: z.union([z.string(), z.number()]).optional(),
  // Glass effects map to BACKGROUND_BLUR and have radius/blur property
  // color, x, y, spread are not applicable
}).strict();

// Union of all effect types
export const effectValueSchema = z.union([
  shadowEffectSchema,
  glassEffectSchema,
]);

// Array of effects (for multiple effects on a single token)
export const effectArraySchema = z.array(effectValueSchema);

// Complete effect token schema (single effect or array of effects)
export const effectTokenSchema = z.union([
  effectValueSchema,
  effectArraySchema,
  z.string(), // Allow string references
]);

// Schema for effect token with metadata
export const effectTokenWithMetadataSchema = z.object({
  value: effectTokenSchema,
  type: z.literal('boxShadow'),
  description: z.string().optional(),
}).passthrough();

// Dollar-prefixed version for W3C token format
export const dollarPrefixedEffectTokenSchema = z.object({
  $value: effectTokenSchema,
  $type: z.literal('boxShadow'),
  $description: z.string().optional(),
}).passthrough();

// Union of both formats
export const singleEffectTokenSchema = z.union([
  effectTokenWithMetadataSchema,
  dollarPrefixedEffectTokenSchema,
]);