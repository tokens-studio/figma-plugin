interface Modifier <T extends string, V> {
  type: T
  value: V
}
interface ColorGenericeModifier<T extends string, V> extends Modifier<T, V> {
  space: 'LCH' | 'sRGB' | 'P3'
}

interface LightenModifier extends ColorGenericeModifier<'lighten', number> {}
interface DarkenModifier extends ColorGenericeModifier<'darken', number> {}
interface MixModifier extends ColorGenericeModifier<'mix', number> {
  color: string;
}
interface AlphaModifier extends ColorGenericeModifier<'alpha', number> {}

export type ColorModifier = LightenModifier | DarkenModifier | MixModifier | AlphaModifier;
