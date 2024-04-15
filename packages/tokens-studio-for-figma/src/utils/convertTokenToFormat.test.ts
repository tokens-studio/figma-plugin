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
      value: '12px',
      type: 'sizing',
      description: 'Size for small text',
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
