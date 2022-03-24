import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from './SingleToken';
export declare type TokenTypeSchema = {
    label: string;
    property: string;
    type: TokenTypes;
    explainer?: string;
    help?: string;
    schema: {
        value?: SingleToken['value'];
        options?: {
            description?: string;
        };
    };
};
