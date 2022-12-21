import { InterpolationMode } from 'chroma-js';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';

interface Modifier <T extends string, V> {
  type: T
  value: V
}
interface ColorGenericModifier<T extends ColorModifierTypes, V> extends Modifier<T, V> {
  space: InterpolationMode
}

export interface LightenModifier extends ColorGenericModifier<ColorModifierTypes.LIGHTEN, number> {}
export interface DarkenModifier extends ColorGenericModifier<ColorModifierTypes.DARKEN, number> {}
export interface MixModifier extends ColorGenericModifier<ColorModifierTypes.MIX, number> {
  color: string;
}
export interface AlphaModifier extends ColorGenericModifier<ColorModifierTypes.ALPHA, number> {}

export type ColorModifier = LightenModifier | DarkenModifier | MixModifier | AlphaModifier;
