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
