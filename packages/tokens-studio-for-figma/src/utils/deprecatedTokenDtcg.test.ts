import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import convertToTokenArray from './convertTokens';
import stringifyTokens from './stringifyTokens';

describe('$deprecated in DTCG format', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });

  it('preserves $deprecated when parsing DTCG JSON into token state', () => {
    const input = {
      'old-blue': {
        $type: 'color',
        $value: '#2563EB',
        $deprecated: {
          severity: 'warning',
          message: 'Use blue-500 instead',
        },
      },
    };

    const result = convertToTokenArray({ tokens: input as any });
    const token = result.find((t: any) => t.name === 'old-blue') as any;

    expect(token).toBeDefined();
    expect(token.$deprecated).toEqual({
      severity: 'warning',
      message: 'Use blue-500 instead',
    });
  });

  it('writes $deprecated into DTCG JSON after $value', () => {
    const tokens = {
      global: [
        {
          name: 'old-blue',
          type: 'color',
          value: '#2563EB',
          $deprecated: {
            severity: 'warning',
            message: 'Use blue-500 instead',
          },
        },
      ],
    };

    const json = stringifyTokens(tokens as any, 'global');
    const parsed = JSON.parse(json);

    expect(parsed['old-blue']).toEqual({
      $type: 'color',
      $value: '#2563EB',
      $deprecated: {
        severity: 'warning',
        message: 'Use blue-500 instead',
      },
    });

    // $deprecated should be the last key (metadata follows value)
    expect(Object.keys(parsed['old-blue'])).toEqual(['$type', '$value', '$deprecated']);
  });

  it('does not add $deprecated for non-deprecated tokens', () => {
    const tokens = {
      global: [
        {
          name: 'blue', type: 'color', value: '#2563EB',
        },
      ],
    };

    const json = stringifyTokens(tokens as any, 'global');
    const parsed = JSON.parse(json);

    expect('$deprecated' in parsed.blue).toBe(false);
  });
});
