import { convertTokenToFormat } from './convertTokenToFormat';
import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';

describe('convertTokenToFormat', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });
  it('should return an object with the same properties as the input, but with the keys replaced', () => {
    const token = {
      type: 'sizing',
      value: '12px',
      description: 'Size for small text',
      extra: 'extra value',
    };

    const result = convertTokenToFormat(token);

    expect(result).toEqual({
      extra: 'extra value',
      $value: '12px',
      $type: 'sizing',
      $description: 'Size for small text',
    });
  });

  it('should include value field even when value is 0', () => {
    const token = {
      type: 'letterSpacing',
      value: 0,
    };

    const result = convertTokenToFormat(token);

    expect(result).toEqual({
      $value: 0,
      $type: 'letterSpacing',
    });
  });

  it('should include value field even when value is empty string', () => {
    const token = {
      type: 'string',
      value: '',
    };

    const result = convertTokenToFormat(token);

    expect(result).toEqual({
      $value: '',
      $type: 'string',
    });
  });

  it('should convert numeric fontWeights values to numbers', () => {
    const token = {
      type: 'fontWeights',
      value: '700',
    };

    const result = convertTokenToFormat(token);

    expect(result).toEqual({
      $value: 700,
      $type: 'fontWeights',
    });
  });

  it('should keep non-numeric fontWeights values as strings', () => {
    expect(convertTokenToFormat({ type: 'fontWeights', value: 'Bold' })).toEqual({
      $value: 'Bold',
      $type: 'fontWeights',
    });
    expect(convertTokenToFormat({ type: 'fontWeights', value: '{fontWeights.base}' })).toEqual({
      $value: '{fontWeights.base}',
      $type: 'fontWeights',
    });
    expect(convertTokenToFormat({ type: 'fontWeights', value: '0700' })).toEqual({
      $value: '0700',
      $type: 'fontWeights',
    });
  });

  it('should convert numeric number token values to numbers', () => {
    const token = {
      type: 'number',
      value: '42',
    };

    const result = convertTokenToFormat(token);

    expect(result).toEqual({
      $value: 42,
      $type: 'number',
    });
  });

  it('should convert a numeric fontWeight inside an expanded composite token', () => {
    const result = convertTokenToFormat({ fontFamily: 'Inter', fontWeight: '700' }, true);

    expect(result).toEqual({
      fontFamily: 'Inter',
      fontWeight: 700,
    });
  });
});

describe('convertTokenToFormat', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.Legacy);
  });

  it('converts to chosen format', async () => {
    const token = {
      type: 'sizing',
      value: '12px',
      description: 'Size for small text',
      extra: 'extra value',
    };

    const result = convertTokenToFormat(token);

    expect(result).toEqual({
      extra: 'extra value',
      value: '12px',
      type: 'sizing',
      description: 'Size for small text',
    });
  });
});
