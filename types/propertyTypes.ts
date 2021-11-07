import {SingleTokenObject, TokenType} from './tokens';
import {ColorRgba, ColorHsla} from './valueTypes';

export type TypographyObject = {
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: string;
    lineHeight?: string | number;
    letterSpacing?: string;
    paragraphSpacing?: string;
};

type ShadowType = 'dropShadow' | 'innerShadow';

export type ShadowTokenSingleValue = {
    color: string;
    type: ShadowType;
    x: string | number;
    y: string | number;
    blur: string | number;
    spread: string | number;
    blendMode?: string;
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

export type ColorToken = SingleTokenObject;
