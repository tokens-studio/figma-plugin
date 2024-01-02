type TokenFormatOptions = 'dtcg' | 'legacy';

type State = {
  inspectDeep: boolean;
  shouldSendSelectionValues: boolean;
};

const store: State = {
  inspectDeep: false,
  shouldSendSelectionValues: false,
};

export class TokenFormatStoreClass {
  public tokenValueKey: 'value' | '$value';

  public tokenTypeKey: 'type' | '$type';

  public tokenDescriptionKey: 'description' | '$description';

  public format: 'dtcg' | 'legacy';

  constructor() {
    this.tokenValueKey = '$value';
    this.tokenTypeKey = '$type';
    this.tokenDescriptionKey = '$description';
    this.format = 'dtcg';
  }

  public setFormat = (format: TokenFormatOptions) => {
    this.tokenValueKey = format === 'dtcg' ? '$value' : 'value';
    this.tokenTypeKey = format === 'dtcg' ? '$type' : 'type';
    this.tokenDescriptionKey = format === 'dtcg' ? '$description' : 'description';
  };
}

export const TokenFormat = new TokenFormatStoreClass();
export const { setFormat } = TokenFormat;

export default store;
