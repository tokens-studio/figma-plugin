export interface TokenProps {
    values: {
        [key: string]: string;
    };
    updatedAt: string;
    version: string;
}

export type SingleToken = string | number | TokenGroup;

export interface TokenGroup {
    [key: string]: SingleToken;
}

export interface Tokens {
    [key: string]: TokenObject;
}

export interface TokenObject {
    hasErrored?: boolean;
    values: string;
}
