export enum TokenFormatOptions {
  DTCG = 'dtcg',
  Legacy = 'legacy',
}

export const TOKEN_FORMAT_OPTIONS = {
  [TokenFormatOptions.DTCG]: { label: 'DTCG', value: TokenFormatOptions.DTCG },
  [TokenFormatOptions.Legacy]: { label: 'Legacy', value: TokenFormatOptions.Legacy },
};

export class TokenFormatStoreClass {
  public tokenValueKey: 'value' | '$value';

  public tokenTypeKey: 'type' | '$type';

  public tokenDescriptionKey: 'description' | '$description';

  public format: TokenFormatOptions;

  constructor() {
    this.tokenValueKey = '$value';
    this.tokenTypeKey = '$type';
    this.tokenDescriptionKey = '$description';
    this.format = TokenFormatOptions.DTCG;
  }

  public setFormat = (format: TokenFormatOptions) => {
    this.format = format;
    this.tokenValueKey = format === TokenFormatOptions.DTCG ? '$value' : 'value';
    this.tokenTypeKey = format === TokenFormatOptions.DTCG ? '$type' : 'type';
    this.tokenDescriptionKey = format === TokenFormatOptions.DTCG ? '$description' : 'description';
  };

  public getFormat = () => this.format;
}

export const TokenFormat = new TokenFormatStoreClass();
export const { setFormat, getFormat } = TokenFormat;
