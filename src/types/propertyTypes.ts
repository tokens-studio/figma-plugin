import { SingleTokenObject, TokenType } from './tokens';
import { ColorRgba, ColorHsla } from './valueTypes'x

export type propertyObject = {
  description?: string;
  data?: MetaDataObject;
  value: string | number;
  type?: TokenType;
  name: string;
};

export type fillValuesType = ColorRgba | ColorHsla;

export enum GradientType {
  GRADIENT_LINEAR = 'GRADIENT_LINEAR',
}

export type gradientStopType = {
  color: fillValuesType;
  position: number;
};

export type MetaDataObject = {
  figmaStyleId?: string;
};

export type ColorToken = SingleTokenObject;
