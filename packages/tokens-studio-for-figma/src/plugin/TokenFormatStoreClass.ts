export type TokenFormatOptions = 'dtcg' | 'legacy';

export class TokenFormatStoreClass {
  public tokenValueKey: 'value' | '$value';

  public tokenTypeKey: 'type' | '$type';

  public tokenDescriptionKey: 'description' | '$description';

  public format: 'dtcg' | 'legacy';

  constructor() {
    this.tokenValueKey = 'value';
    this.tokenTypeKey = 'type';
    this.tokenDescriptionKey = 'description';
    this.format = 'legacy';
  }

  public setFormat = (format: TokenFormatOptions) => {
    this.tokenValueKey = format === 'dtcg' ? '$value' : 'value';
    this.tokenTypeKey = format === 'dtcg' ? '$type' : 'type';
    this.tokenDescriptionKey = format === 'dtcg' ? '$description' : 'description';
  };
}

export const TokenFormat = new TokenFormatStoreClass();
export const { setFormat } = TokenFormat;
