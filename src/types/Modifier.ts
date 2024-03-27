import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

interface Modifier <T extends string, V> {
  type: T
  value: V
}
interface ColorGenericModifier<T extends ColorModifierTypes, V> extends Modifier<T, V> {
  space: ColorSpaceTypes
}

export interface LightenModifier extends ColorGenericModifier<ColorModifierTypes.LIGHTEN, string> {}
export interface DarkenModifier extends ColorGenericModifier<ColorModifierTypes.DARKEN, string> {}
export interface MixModifier extends ColorGenericModifier<ColorModifierTypes.MIX, string> {
  color: string;
}
export interface AlphaModifier extends ColorGenericModifier<ColorModifierTypes.ALPHA, string> {}
export interface LumianceModifier extends ColorGenericModifier<ColorModifierTypes.LUMINANCE, string> {}

export interface MultiplyModifier extends ColorGenericModifier<ColorModifierTypes.MULTIPLY, string> {
  color: string;
}
export interface ScreenModifier extends ColorGenericModifier<ColorModifierTypes.SCREEN, string> {
  color: string;
}
export interface OverlayModifier extends ColorGenericModifier<ColorModifierTypes.OVERLAY, string> {
  color: string;
}
export interface ColorDodgeModifier extends ColorGenericModifier<ColorModifierTypes.COLOR_DODGE, string> {
  color: string;
}
export interface ColorBurnModifier extends ColorGenericModifier<ColorModifierTypes.COLOR_BURN, string> {
  color: string;
}
export interface HardLightModifier extends ColorGenericModifier<ColorModifierTypes.HARD_LIGHT, string> {
  color: string;
}
export interface SoftLightModifier extends ColorGenericModifier<ColorModifierTypes.SOFT_LIGHT, string> {
  color: string;
}
export interface DifferenceModifier extends ColorGenericModifier<ColorModifierTypes.DIFFERENCE, string> {
  color: string;
}
export interface ExclusionModifier extends ColorGenericModifier<ColorModifierTypes.EXCLUSION, string> {
  color: string;
}

export interface AddModifier extends ColorGenericModifier<ColorModifierTypes.ADD, string> {
  color: string;
}
export interface SubtractModifier extends ColorGenericModifier<ColorModifierTypes.SUBTRACT, string> {
  color: string;
}

export type SingleColorModifier = LightenModifier | DarkenModifier | AlphaModifier | LumianceModifier;
export type BlendColorModifier = MultiplyModifier | ScreenModifier | OverlayModifier | ColorDodgeModifier | ColorBurnModifier | HardLightModifier | SoftLightModifier | DifferenceModifier | ExclusionModifier | AddModifier | SubtractModifier;

export type ColorModifier = SingleColorModifier | BlendColorModifier;

export const isTwoColorModifier = (modifier: ColorModifier): modifier is BlendColorModifier => modifier.type === ColorModifierTypes.MULTIPLY || modifier.type === ColorModifierTypes.SCREEN || modifier.type === ColorModifierTypes.OVERLAY || modifier.type === ColorModifierTypes.COLOR_DODGE || modifier.type === ColorModifierTypes.COLOR_BURN || modifier.type === ColorModifierTypes.HARD_LIGHT || modifier.type === ColorModifierTypes.SOFT_LIGHT || modifier.type === ColorModifierTypes.DIFFERENCE || modifier.type === ColorModifierTypes.EXCLUSION || modifier.type === ColorModifierTypes.ADD || modifier.type === ColorModifierTypes.SUBTRACT;
