export interface TokenProps {
    values: {
        [key: string]: string;
    };
    updatedAt: string;
    version: string;
}

export type SingleToken = string | number | TokenGroup;

export type SingleTokenObject = {
    id: string;
    name: string;
    value: string;
    type: TokenType | string | 'undefined';
    description: string;
};

export interface TokenGroup {
    [key: string]: SingleToken;
}

export interface TokenArrayGroup {
    [key: string]: SingleTokenObject;
}

export interface Tokens {
    [key: string]: TokenObject;
}

export interface TokenObject {
    hasErrored?: boolean;
    values: TokenArrayGroup;
    type: 'array' | 'object';
}

export type TokenType =
    | 'color'
    | 'implicit'
    | 'borderRadius'
    | 'size'
    | 'space'
    | 'text'
    | 'typography'
    | 'opacity'
    | 'borderWidth'
    | 'shadow'
    | 'fontFamilies'
    | 'fontWeights'
    | 'lineHeights'
    | 'fontSizes'
    | 'letterSpacing'
    | 'paragraphSpacing';
