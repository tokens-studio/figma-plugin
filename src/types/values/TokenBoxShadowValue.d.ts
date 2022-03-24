import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
export declare type TokenBoxshadowValue = {
    color: string;
    type: BoxShadowTypes;
    x: string | number;
    y: string | number;
    blur: string | number;
    spread: string | number;
    blendMode?: string;
};
