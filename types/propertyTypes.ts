import {TokenType} from './tokens';
import {ColorRgba, ColorHsla} from './valueTypes';

export type TypographyObject = {
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: string;
    lineHeight?: string | number;
    letterSpacing?: string;
    paragraphSpacing?: string;
};

export type TypographyToken = {
    value: TypographyObject;
    name: string;
    description?: string;
    type?: TokenType;
};

export type ShadowTokenSingleValue = {
    color: string;
    type: 'dropShadow' | 'innerShadow';
    x: string | number;
    y: string | number;
    radius: string | number;
    spread: string | number;
};

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

export type ColorToken = propertyObject;
export type EffectToken = Omit<propertyObject, 'value'> & {
    value: ShadowTokenSingleValue[] | ShadowTokenSingleValue;
};
