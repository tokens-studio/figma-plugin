import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

export type TokenBoxshadowValue = {
  type: BoxShadowTypes;
  // For shadow effects (DROP_SHADOW, INNER_SHADOW)
  color?: string;
  x?: string | number;
  y?: string | number;
  spread?: string | number;
  // For all effects
  blur?: string | number; // radius for glass/blur effects
  blendMode?: string;
};
