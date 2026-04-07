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

  it('DTCG: includes $deprecated: true in output', () => {
    const token = { type: 'color', value: '#ff0000', $deprecated: true };
    const result = convertTokenToFormat(token);
    expect(result.$deprecated).toBe(true);
  });

  it('DTCG: omits $deprecated when false or absent', () => {
    expect(convertTokenToFormat({ type: 'color', value: '#ff0000', $deprecated: false }).$deprecated).toBeUndefined();
    expect(convertTokenToFormat({ type: 'color', value: '#ff0000' }).$deprecated).toBeUndefined();
  });
});

describe('convertTokenToFormat', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.Legacy);
  });

  it('Legacy: moves $deprecated into $extensions[studio.tokens].deprecated', () => {
    const token = { type: 'color', value: '#ff0000', $deprecated: true };
    const result = convertTokenToFormat(token);
    expect(result.$deprecated).toBeUndefined();
    expect(result.$extensions?.['studio.tokens']?.deprecated).toBe(true);
  });

  it('Legacy: omits deprecated from $extensions when false or absent', () => {
    expect(convertTokenToFormat({ type: 'color', value: '#ff0000', $deprecated: false }).$extensions?.['studio.tokens']?.deprecated).toBeUndefined();
    expect(convertTokenToFormat({ type: 'color', value: '#ff0000' }).$extensions?.['studio.tokens']?.deprecated).toBeUndefined();
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
