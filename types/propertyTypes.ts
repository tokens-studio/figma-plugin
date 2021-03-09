import {ColorRgba, ColorHsla} from './valueTypes';

export type TypographyToken = {
    value: {
        fontFamily?: string;
        fontWeight?: string;
        fontSize?: string;
        lineHeight?: string | number;
        letterSpacing?: string;
        paragraphSpacing?: string;
    };
    description?: string;
};

export type propertyObject = {
    description?: string;
    data?: MetaDataObject;
    value?: any;
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
